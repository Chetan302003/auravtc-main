import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import DownloadVTCList from '@/components/booking/DownloadVTCList';
import WebhookSender from '@/components/booking/WebhookSender';
import BulkSlotEditor from '@/components/admin/BulkSlotEditor';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import {
  Loader2,
  Settings,
  Lock,
  Unlock,
  Check,
  X,
  Trash2,
  RefreshCw,
  Tag,
  Users,
  Calendar,
  ToggleLeft,
  Plus,
  Image as ImageIcon,
  Download,
  Webhook,
} from 'lucide-react';

interface Event {
  id: number;
  name: string;
  start_at: string;
  banner?: string | null;
  slot_booking_enabled?: boolean;
  server?: { id: number; name: string };
  departure?: { city: string; location: string };
  arrive?: { city: string; location: string };
  attendances?: { confirmed: number };
}

interface Slot {
  id: string;
  event_id: string;
  slot_number: number;
  slot_label: string | null;
  is_locked: boolean;
  locked_for: string | null;
  slot_image_url: string | null;
}

interface Booking {
  id: string;
  event_id: string;
  slot_number: number;
  vtc_name: string;
  contact_name: string | null;
  discord_id: string;
  member_count: number;
  status: string;
  notes: string | null;
  created_at: string;
  contact_email: string | null;
  discord_message_id: string | null;
}

interface SlotManagementProps {
  isAdmin: boolean;
}

const SlotManagement = ({ isAdmin }: SlotManagementProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [slotLabel, setSlotLabel] = useState('');
  const [lockedFor, setLockedFor] = useState('');
  const [slotImageUrl, setSlotImageUrl] = useState('');
  const [bookingToggleStates, setBookingToggleStates] = useState<Record<number, boolean>>({});
  const [slotCount, setSlotCount] = useState(20);
  const [newSlotCount, setNewSlotCount] = useState('20');

  // Fetch TruckersMP VTC events
  useEffect(() => {
    fetchEvents();
  }, []);

  // Setup realtime subscription for bookings
  useEffect(() => {
    if (!selectedEventId) return;

    const channel = supabase
      .channel('slot-bookings-admin')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'slot_bookings',
          filter: `event_id=eq.${selectedEventId}`,
        },
        () => {
          fetchBookings(selectedEventId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      // Fetch from VTC events API (our own events)
      const { data, error } = await supabase.functions.invoke('truckersmp-vtc-events');
      if (error) throw error;

      if (data?.events) {
        // Fetch booking enabled states from new event_booking_settings table
        const eventIds = data.events.map((e: Event) => e.id.toString());
        const { data: bookingSettings } = await supabase
          .from('event_booking_settings')
          .select('truckersmp_event_id, booking_enabled')
          .in('truckersmp_event_id', eventIds);

        const toggleStates: Record<number, boolean> = {};
        bookingSettings?.forEach(s => {
          toggleStates[parseInt(s.truckersmp_event_id)] = s.booking_enabled ?? true;
        });
        setBookingToggleStates(toggleStates);

        setEvents(data.events.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchSlots = async (eventId: string) => {
    const { data, error } = await supabase
      .from('event_slots')
      .select('*')
      .eq('event_id', eventId)
      .order('slot_number');

    if (!error && data) {
      setSlots(data as Slot[]);
      // Update slot count based on existing slots
      if (data.length > 0) {
        const maxSlot = Math.max(...data.map(s => s.slot_number));
        setSlotCount(maxSlot);
        setNewSlotCount(maxSlot.toString());
      }
    }
  };

  const fetchBookings = async (eventId: string) => {
    const { data, error } = await supabase
      .from('slot_bookings')
      .select('*')
      .eq('event_id', eventId)
      .order('slot_number');

    if (!error && data) {
      setBookings(data as Booking[]);
    }
  };

  const handleEventSelect = async (eventId: string) => {
    setSelectedEventId(eventId);
    const event = events.find(e => e.id.toString() === eventId);
    setSelectedEvent(event || null);
    setLoading(true);
    await Promise.all([fetchSlots(eventId), fetchBookings(eventId)]);
    setLoading(false);
  };

  const handleToggleBookingSystem = async (eventId: number, enabled: boolean) => {
    setActionLoading(`toggle-${eventId}`);
    try {
      // Use the new event_booking_settings table with TruckersMP event ID as text
      const { data: existingSetting } = await supabase
        .from('event_booking_settings')
        .select('id')
        .eq('truckersmp_event_id', eventId.toString())
        .maybeSingle();

      if (existingSetting) {
        // Update existing setting
        const { error } = await supabase
          .from('event_booking_settings')
          .update({ booking_enabled: enabled })
          .eq('truckersmp_event_id', eventId.toString());

        if (error) throw error;
      } else {
        // Insert new setting
        const { error } = await supabase
          .from('event_booking_settings')
          .insert({
            truckersmp_event_id: eventId.toString(),
            booking_enabled: enabled,
          });

        if (error) throw error;
      }

      setBookingToggleStates(prev => ({ ...prev, [eventId]: enabled }));
      toast.success(`Slot booking ${enabled ? 'enabled' : 'disabled'} for this event`);
    } catch (error: any) {
      console.error('Toggle error:', error);
      toast.error(error.message || 'Failed to update booking status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateSlotCount = async () => {
    if (!selectedEventId || !isAdmin) return;
    const count = parseInt(newSlotCount);
    if (isNaN(count) || count < 1 || count > 200) {
      toast.error('Slot count must be between 1 and 200');
      return;
    }

    setActionLoading('slot-count');
    try {
      // Create slots up to the new count
      const existingSlotNumbers = slots.map(s => s.slot_number);
      const slotsToCreate = [];

      for (let i = 1; i <= count; i++) {
        if (!existingSlotNumbers.includes(i)) {
          slotsToCreate.push({
            event_id: selectedEventId,
            slot_number: i,
            slot_label: null,
            is_locked: false,
            locked_for: null,
            slot_image_url: selectedEvent?.banner || null,
          });
        }
      }

      if (slotsToCreate.length > 0) {
        const { error } = await supabase
          .from('event_slots')
          .insert(slotsToCreate);
        if (error) throw error;
      }

      // Delete slots above the new count
      if (count < slotCount) {
        const { error } = await supabase
          .from('event_slots')
          .delete()
          .eq('event_id', selectedEventId)
          .gt('slot_number', count);
        if (error) throw error;
      }

      setSlotCount(count);
      toast.success(`Updated to ${count} slots`);
      await fetchSlots(selectedEventId);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update slot count');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveReject = async (booking: Booking, action: 'accept' | 'reject') => {
    if (!isAdmin) return;
    setActionLoading(booking.id);

    try {
      const { error } = await supabase.functions.invoke('discord-booking-callback', {
        body: {
          booking_id: booking.id,
          action,
          reviewer: 'Admin Dashboard',
        },
      });

      if (error) throw error;

      toast.success(`Booking ${action === 'accept' ? 'approved' : 'rejected'} successfully`);
      await fetchBookings(selectedEventId!);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateSlot = async () => {
    if (!editingSlot || !isAdmin) return;
    setActionLoading(editingSlot.id);

    try {
      const { error } = await supabase
        .from('event_slots')
        .upsert({
          id: editingSlot.id.startsWith('temp-') ? undefined : editingSlot.id,
          event_id: editingSlot.event_id,
          slot_number: editingSlot.slot_number,
          slot_label: slotLabel || null,
          is_locked: !!lockedFor,
          locked_for: lockedFor || null,
          slot_image_url: slotImageUrl || selectedEvent?.banner || null,
        }, { onConflict: 'event_id,slot_number', ignoreDuplicates: false });

      if (error) throw error;

      toast.success('Slot updated successfully');
      setEditingSlot(null);
      await fetchSlots(selectedEventId!);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update slot');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBooking = async (booking: Booking) => {
    if (!isAdmin) return;
    setActionLoading(booking.id);

    try {
      const { error } = await supabase
        .from('slot_bookings')
        .delete()
        .eq('id', booking.id);

      if (error) throw error;

      toast.success('Booking deleted successfully');
      await fetchBookings(selectedEventId!);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAllEventData = async () => {
    if (!isAdmin || !selectedEventId) return;
    setActionLoading('delete-all');

    try {
      const { error: bookingError } = await supabase
        .from('slot_bookings')
        .delete()
        .eq('event_id', selectedEventId);

      if (bookingError) throw bookingError;

      const { error: slotError } = await supabase
        .from('event_slots')
        .delete()
        .eq('event_id', selectedEventId);

      if (slotError) throw slotError;

      toast.success('All event booking data deleted successfully');
      setSlots([]);
      setBookings([]);
      setSlotCount(20);
      setNewSlotCount('20');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete event data');
    } finally {
      setActionLoading(null);
    }
  };

  const openEditSlotDialog = (slotNumber: number) => {
    const existingSlot = slots.find(s => s.slot_number === slotNumber);
    if (existingSlot) {
      setEditingSlot(existingSlot);
      setSlotLabel(existingSlot.slot_label || '');
      setLockedFor(existingSlot.locked_for || '');
      setSlotImageUrl(existingSlot.slot_image_url || '');
    } else {
      setEditingSlot({
        id: `temp-${slotNumber}`,
        event_id: selectedEventId!,
        slot_number: slotNumber,
        slot_label: null,
        is_locked: false,
        locked_for: null,
        slot_image_url: null,
      });
      setSlotLabel('');
      setLockedFor('');
      setSlotImageUrl('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!isAdmin) {
    return (
      <div className="glass-card rounded-xl border border-primary/20 p-6">
        <p className="text-muted-foreground text-center">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl border border-primary/20 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border/30">
        <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Slot Management
        </h2>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Event Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Select Event (Our VTC Events)</label>
          <Select onValueChange={handleEventSelect} value={selectedEventId || undefined}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose an event to manage" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id.toString()}>
                  {event.name} - {new Date(event.start_at).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Booking Toggle for Events */}
        {events.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ToggleLeft className="w-4 h-4" />
              Booking System Toggle
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto" data-lenis-prevent>
              {events.slice(0, 6).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm truncate">{event.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {bookingToggleStates[event.id] !== false ? 'On' : 'Off'}
                    </span>
                    <Switch
                      checked={bookingToggleStates[event.id] !== false}
                      onCheckedChange={(checked) => handleToggleBookingSystem(event.id, checked)}
                      disabled={actionLoading === `toggle-${event.id}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedEventId && (
          <>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Slot Count Configuration */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Slot Count
                  </h3>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min="1"
                      max="200"
                      value={newSlotCount}
                      onChange={(e) => setNewSlotCount(e.target.value)}
                      className="w-24"
                    />
                    <Button
                      onClick={handleUpdateSlotCount}
                      disabled={actionLoading === 'slot-count'}
                      size="sm"
                    >
                      {actionLoading === 'slot-count' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Update'
                      )}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Current: {slotCount} slots
                    </span>
                    <BulkSlotEditor
                      eventId={selectedEventId}
                      slotCount={slotCount}
                      onComplete={() => fetchSlots(selectedEventId)}
                    />
                  </div>
                </div>

                {/* Slot Configuration Grid */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Configure Slots
                  </h3>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 rounded-lg bg-secondary/20" data-lenis-prevent>
                    {Array.from({ length: slotCount }, (_, i) => i + 1).map((num) => {
                      const slot = slots.find(s => s.slot_number === num);
                      const booking = bookings.find(b => b.slot_number === num);
                      const isLocked = slot?.is_locked;
                      const isBooked = booking?.status === 'approved';
                      const isPending = booking?.status === 'pending';

                      return (
                        <Dialog key={num}>
                          <DialogTrigger asChild>
                            <button
                              onClick={() => openEditSlotDialog(num)}
                              className={`w-8 h-8 rounded text-xs font-medium transition-all ${isLocked
                                  ? 'bg-purple-500/30 text-purple-400 border border-purple-500/50'
                                  : isBooked
                                    ? 'bg-red-500/30 text-red-400 border border-red-500/50'
                                    : isPending
                                      ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500/50'
                                      : 'bg-green-500/30 text-green-400 border border-green-500/50 hover:bg-green-500/40'
                                }`}
                            >
                              {num}
                            </button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Configure Slot #{num}</DialogTitle>
                              <DialogDescription>
                                Set a custom label, lock for a partner, or add a preview image.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Slot Label</label>
                                <Input
                                  placeholder="e.g., VIP Section, Reserved"
                                  value={slotLabel}
                                  onChange={(e) => setSlotLabel(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Lock for Partner</label>
                                <Input
                                  placeholder="e.g., Partner VTC Name"
                                  value={lockedFor}
                                  onChange={(e) => setLockedFor(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                  Leave empty to keep slot public
                                </p>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                  <ImageIcon className="w-4 h-4" />
                                  Slot Preview Image URL
                                </label>
                                <Input
                                  placeholder="https://i.ibb.co/... or event banner"
                                  value={slotImageUrl}
                                  onChange={(e) => setSlotImageUrl(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                  Image shown when hovering this slot. Defaults to event banner.
                                </p>
                                {(slotImageUrl || selectedEvent?.banner) && (
                                  <div className="mt-2 rounded-lg overflow-hidden border border-border/30">
                                    <img
                                      src={slotImageUrl || selectedEvent?.banner || ''}
                                      alt="Slot preview"
                                      className="w-full h-24 object-cover"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={handleUpdateSlot}
                                disabled={actionLoading === editingSlot?.id}
                              >
                                {actionLoading === editingSlot?.id ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4 mr-2" />
                                )}
                                Save
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      );
                    })}
                  </div>
                </div>

                {/* Export & Webhook Tools */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export & Webhook
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <DownloadVTCList
                      eventName={selectedEvent?.name || 'Event'}
                      approvedBookings={bookings.filter(b => b.status === 'approved').map(b => {
                     const matchedSlot = slots.find(s => s.slot_number === b.slot_number);
                      return {
     slot_number: b.slot_number,
    vtc_name: b.vtc_name,
    member_count: b.member_count,
    discord_id: b.discord_id,
    contact_name: b.contact_name,
    contact_email: b.contact_email,
    notes: b.notes,
    created_at: b.created_at,
    slot_label: slot?.slot_label ?? null,
    slot_image_url: slot?.slot_image_url ?? null,
  };
}))
                    />
                    <WebhookSender
                      event={{
                        id: selectedEvent?.id || 0,
                        name: selectedEvent?.name || '',
                        game: 'ETS2',
                        server: selectedEvent?.server || { id: 0, name: 'Unknown' },
                        departure: selectedEvent?.departure || { location: '', city: '' },
                        arrive: selectedEvent?.arrive || { location: '', city: '' },
                        start_at: selectedEvent?.start_at || '',
                        banner: selectedEvent?.banner || null,
                        attendances: selectedEvent?.attendances ? { confirmed: selectedEvent.attendances.confirmed, unsure: 0 } : { confirmed: 0, unsure: 0 },
                      }}
                      slots={slots.map(s => {
                        const booking = bookings.find(b => b.slot_number === s.slot_number && b.status === 'approved');
                        return {
                          slot_number: s.slot_number,
                          slot_label: s.slot_label,
                          is_locked: s.is_locked,
                          locked_for: s.locked_for,
                          slot_image_url: s.slot_image_url,
                          status: s.is_locked ? 'booked' as const : booking ? 'booked' as const : 'available' as const,
                          booking: booking ? { vtc_name: booking.vtc_name, member_count: booking.member_count } : undefined,
                        };
                      })}
                    />
                  </div>
                </div>

                {/* Bookings Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Bookings ({bookings.length})
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchBookings(selectedEventId)}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>

                  {bookings.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No bookings for this event yet
                    </p>
                  ) : (
                    <div className="overflow-x-auto" data-lenis-prevent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Slot</TableHead>
                            <TableHead>VTC</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Members</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bookings.map((booking) => (
                            <TableRow key={booking.id}>
                              <TableCell className="font-medium">#{booking.slot_number}</TableCell>
                              <TableCell>{booking.vtc_name}</TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-sm">{booking.contact_name || 'N/A'}</span>
                                  <span className="text-xs text-muted-foreground">
                                    <code>&lt;@{booking.discord_id}&gt;</code>
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>{booking.member_count}</TableCell>
                              <TableCell>{getStatusBadge(booking.status)}</TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-1">
                                  {booking.status === 'pending' && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                        onClick={() => handleApproveReject(booking, 'accept')}
                                        disabled={actionLoading === booking.id}
                                      >
                                        {actionLoading === booking.id ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <Check className="w-4 h-4" />
                                        )}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                        onClick={() => handleApproveReject(booking, 'reject')}
                                        disabled={actionLoading === booking.id}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </>
                                  )}
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Booking?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will permanently delete the booking for {booking.vtc_name}.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          onClick={() => handleDeleteBooking(booking)}
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>

                {/* Delete All Data */}
                <div className="pt-4 border-t border-border/30">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full"
                        disabled={actionLoading === 'delete-all'}
                      >
                        {actionLoading === 'delete-all' ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Delete All Event Booking Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete All Event Data?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete ALL slots and bookings for this event.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={handleDeleteAllEventData}
                        >
                          Delete Everything
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SlotManagement;
