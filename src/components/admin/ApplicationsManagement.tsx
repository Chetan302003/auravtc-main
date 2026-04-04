import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Loader2,
  FileText,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  User,
  ExternalLink,
  MessageSquare,
  Filter,
  RefreshCw,
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Application = Tables<'applications'>;

interface ApplicationsManagementProps {
  isAdmin: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  accepted: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="w-3 h-3" />,
  accepted: <CheckCircle className="w-3 h-3" />,
  rejected: <XCircle className="w-3 h-3" />,
};

const ApplicationsManagement = ({ isAdmin }: ApplicationsManagementProps) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dialog state
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchQuery, statusFilter]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const filterApplications = () => {
    let filtered = [...applications];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(query) ||
        app.discord_id.toLowerCase().includes(query) ||
        app.truckermp_id.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  };

  const handleAccept = async (application: Application) => {
  setActionLoading(`accept-${application.id}`);
  try {
    const res = await fetch(
      `${supabase.supabaseUrl}/functions/v1/aura-hr-handler`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabase.supabaseKey,
          "Authorization": `Bearer ${supabase.supabaseKey}`,
        },
        body: JSON.stringify({
          action: "accept",
          application_id: application.id,
          discord_id: application.discord_id,
          name: application.name,
          reviewed_by: "Website Admin",
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to accept");
    }

    setApplications(prev =>
      prev.map(app =>
        app.id === application.id
          ? { ...app, status: 'accepted', reviewed_at: new Date().toISOString() }
          : app
      )
    );

    toast.success(`Application from ${application.name} accepted`);
    setIsDetailsDialogOpen(false);
  } catch (err: any) {
    toast.error(err.message || 'Failed to accept application');
  } finally {
    setActionLoading(null);
  }
};

const handleReject = async () => {
  if (!selectedApplication) return;
  if (!rejectionReason.trim()) {
    toast.error('Please provide a rejection reason');
    return;
  }

  setActionLoading(`reject-${selectedApplication.id}`);
  try {
    const res = await fetch(
      `${supabase.supabaseUrl}/functions/v1/aura-hr-handler`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabase.supabaseKey,
          "Authorization": `Bearer ${supabase.supabaseKey}`,
        },
        body: JSON.stringify({
          action: "reject",
          application_id: selectedApplication.id,
          discord_id: selectedApplication.discord_id,
          name: selectedApplication.name,
          reason: rejectionReason,
          reviewed_by: "Website Admin",
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to reject");
    }

    setApplications(prev =>
      prev.map(app =>
        app.id === selectedApplication.id
          ? { ...app, status: 'rejected', rejection_reason: rejectionReason, reviewed_at: new Date().toISOString() }
          : app
      )
    );

    toast.success(`Application from ${selectedApplication.name} rejected`);
    setIsRejectDialogOpen(false);
    setIsDetailsDialogOpen(false);
    setRejectionReason('');
  } catch (err: any) {
    toast.error(err.message || 'Failed to reject application');
  } finally {
    setActionLoading(null);
  }
};
  // const handleAccept = async (application: Application) => {
  //   setActionLoading(`accept-${application.id}`);
  //   try {
  //     // Call the edge function to handle Discord notification
  //     const { error: fnError } = await supabase.functions.invoke('aura-hr-handler', {
  //       body: {
  //         action: 'accept',
  //         application_id: application.id,
  //         discord_id: application.discord_id,
  //         name: application.name,
  //       },
  //     });

  //     if (fnError) throw fnError;

  //     // Update local state
  //     setApplications(prev =>
  //       prev.map(app =>
  //         app.id === application.id
  //           ? { ...app, status: 'accepted', reviewed_at: new Date().toISOString() }
  //           : app
  //       )
  //     );

  //     toast.success(`Application from ${application.name} accepted`);
  //     setIsDetailsDialogOpen(false);
  //   } catch (err: any) {
  //     toast.error(err.message || 'Failed to accept application');
  //   } finally {
  //     setActionLoading(null);
  //   }
  // };

  // const handleReject = async () => {
  //   if (!selectedApplication) return;

  //   if (!rejectionReason.trim()) {
  //     toast.error('Please provide a rejection reason');
  //     return;
  //   }

  //   setActionLoading(`reject-${selectedApplication.id}`);
  //   try {
  //     // Call the edge function to handle Discord notification
  //     const { error: fnError } = await supabase.functions.invoke('aura-hr-handler', {
  //       body: {
  //         action: 'reject',
  //         application_id: selectedApplication.id,
  //         discord_id: selectedApplication.discord_id,
  //         name: selectedApplication.name,
  //         reason: rejectionReason,
  //       },
  //     });

  //     if (fnError) throw fnError;

  //     // Update local state
  //     setApplications(prev =>
  //       prev.map(app =>
  //         app.id === selectedApplication.id
  //           ? {
  //             ...app,
  //             status: 'rejected',
  //             rejection_reason: rejectionReason,
  //             reviewed_at: new Date().toISOString()
  //           }
  //           : app
  //       )
  //     );

  //     toast.success(`Application from ${selectedApplication.name} rejected`);
  //     setIsRejectDialogOpen(false);
  //     setIsDetailsDialogOpen(false);
  //     setRejectionReason('');
  //   } catch (err: any) {
  //     toast.error(err.message || 'Failed to reject application');
  //   } finally {
  //     setActionLoading(null);
  //   }
  // };

  const openDetailsDialog = (application: Application) => {
    setSelectedApplication(application);
    setIsDetailsDialogOpen(true);
  };

  const openRejectDialog = (application: Application) => {
    setSelectedApplication(application);
    setRejectionReason('');
    setIsRejectDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Stats
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  if (!isAdmin) {
    return (
      <div className="glass-card rounded-xl border border-primary/20 p-6">
        <p className="text-muted-foreground text-center">HR or Admin access required</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl border border-primary/20 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            HR Applications
          </h2>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3 rounded-lg bg-secondary/30 border border-border/30 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            <p className="text-xs text-yellow-400/70">Pending</p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.accepted}</p>
            <p className="text-xs text-green-400/70">Accepted</p>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
            <p className="text-xs text-red-400/70">Rejected</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 py-3 bg-secondary/20 border-b border-border/30 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, Discord ID, or TMP ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {applications.length === 0
                ? 'No applications received yet'
                : 'No applications match your filters'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto" data-lenis-prevent>
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border border-border/30 bg-secondary/30 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => openDetailsDialog(application)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground">{application.name}</p>
                    <Badge variant="outline" className={STATUS_COLORS[application.status]}>
                      {STATUS_ICONS[application.status]}
                      <span className="ml-1 capitalize">{application.status}</span>
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Age: {application.age}
                    </span>
                    <span>Discord: {application.discord_id}</span>
                    <span>TMP: {application.truckermp_id}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Applied: {formatDate(application.created_at)}
                  </p>
                </div>

                {application.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                      onClick={() => handleAccept(application)}
                      disabled={actionLoading === `accept-${application.id}`}
                    >
                      {actionLoading === `accept-${application.id}` ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      onClick={() => openRejectDialog(application)}
                      disabled={actionLoading?.startsWith('reject')}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-lenis-prevent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Application Details
            </DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">{selectedApplication.name}</span>
                <Badge variant="outline" className={STATUS_COLORS[selectedApplication.status]}>
                  {STATUS_ICONS[selectedApplication.status]}
                  <span className="ml-1 capitalize">{selectedApplication.status}</span>
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Age</p>
                  <p className="font-medium">{selectedApplication.age}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Discord ID</p>
                  <p className="font-medium font-mono">{selectedApplication.discord_id}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">TruckersMP ID</p>
                  <a
                    href={`https://truckersmp.com/user/${selectedApplication.truckermp_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    {selectedApplication.truckermp_id}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm mb-1">Experience</p>
                <p className="text-sm bg-secondary/50 p-3 rounded-lg">
                  {selectedApplication.experience}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground text-sm mb-1">Why do they want to join?</p>
                <p className="text-sm bg-secondary/50 p-3 rounded-lg">
                  {selectedApplication.reason}
                </p>
              </div>

              {selectedApplication.rejection_reason && (
                <div>
                  <p className="text-red-400 text-sm mb-1">Rejection Reason</p>
                  <p className="text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-300">
                    {selectedApplication.rejection_reason}
                  </p>
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Applied: {formatDate(selectedApplication.created_at)}</p>
                {selectedApplication.reviewed_at && (
                  <p>Reviewed: {formatDate(selectedApplication.reviewed_at)}</p>
                )}
              </div>

              {selectedApplication.status === 'pending' && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() => openRejectDialog(selectedApplication)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleAccept(selectedApplication)}
                    disabled={actionLoading === `accept-${selectedApplication.id}`}
                  >
                    {actionLoading === `accept-${selectedApplication.id}` ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Accept
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <XCircle className="w-5 h-5" />
              Reject Application
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application. This will be sent to the applicant via Discord DM.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading?.startsWith('reject') || !rejectionReason.trim()}
            >
              {actionLoading?.startsWith('reject') ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationsManagement;
