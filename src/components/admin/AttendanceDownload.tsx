import { useState } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import * as XLSX from 'xlsx';
import { Download, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AttendanceDownloadProps {
  isAdmin: boolean;
}

const AttendanceDownload = ({ isAdmin }: AttendanceDownloadProps) => {
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [isDownloading, setIsDownloading] = useState(false);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  const handleDownload = async () => {
    if (!isAdmin) {
      toast.error('Only admins can download attendance data');
      return;
    }

    setIsDownloading(true);
    try {
      // Fetch attendance data for the date range
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          *,
          members:member_id (username, tmp_id, vtc_role),
          events:event_id (title, start_time, target_server_name)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (attendanceError) throw attendanceError;

      if (!attendanceData || attendanceData.length === 0) {
        toast.info('No attendance data found for the selected date range');
        setIsDownloading(false);
        return;
      }

      // Transform data for Excel
      const excelData = attendanceData.map((record: any) => ({
        'Event Title': record.events?.title || 'N/A',
        'Event Date': record.events?.start_time 
          ? format(new Date(record.events.start_time), 'yyyy-MM-dd HH:mm')
          : 'N/A',
        'Target Server': record.events?.target_server_name || 'N/A',
        'Member Name': record.members?.username || 'N/A',
        'TruckersMP ID': record.members?.tmp_id || 'N/A',
        'VTC Role': record.members?.vtc_role || 'N/A',
        'Is Present': record.is_present ? 'Yes' : 'No',
        'Server at Check': record.server_name_at_check || 'N/A',
        'Checked At': record.checked_at 
          ? format(new Date(record.checked_at), 'yyyy-MM-dd HH:mm:ss')
          : 'N/A',
        'Notes': record.notes || ''
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      ws['!cols'] = [
        { wch: 30 }, // Event Title
        { wch: 18 }, // Event Date
        { wch: 15 }, // Target Server
        { wch: 20 }, // Member Name
        { wch: 12 }, // TruckersMP ID
        { wch: 12 }, // VTC Role
        { wch: 10 }, // Is Present
        { wch: 15 }, // Server at Check
        { wch: 20 }, // Checked At
        { wch: 30 }, // Notes
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

      // Generate filename with date range
      const filename = `MethVTC_Attendance_${format(startDate, 'yyyyMMdd')}_to_${format(endDate, 'yyyyMMdd')}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
      toast.success('Attendance data downloaded successfully');
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(error.message || 'Failed to download attendance data');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleThisMonth = () => {
    setStartDate(startOfMonth(new Date()));
    setEndDate(endOfMonth(new Date()));
  };

  const handleLastMonth = () => {
    const lastMonth = subMonths(new Date(), 1);
    setStartDate(startOfMonth(lastMonth));
    setEndDate(endOfMonth(lastMonth));
  };

  if (!isAdmin) return null;

  return (
    <div className="glass-card rounded-xl p-6 border border-primary/20">
      <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
        <Download className="w-5 h-5 text-primary" />
        Export Attendance Data
      </h3>
      
      <div className="space-y-4">
        {/* Quick select buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleThisMonth}
            className="text-xs border-border/50 hover:border-primary/50"
          >
            This Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLastMonth}
            className="text-xs border-border/50 hover:border-primary/50"
          >
            Last Month
          </Button>
        </div>

        {/* Date range pickers */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
          <div className="min-w-0">
            <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
            <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal text-xs sm:text-sm border-border/50 hover:border-primary/50 overflow-hidden"
                >
                  <Calendar className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{format(startDate, 'MMM d, yy')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background border-border" align="start">
                <CalendarUI
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    if (date) {
                      setStartDate(date);
                      setIsStartOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="min-w-0">
            <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
            <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal text-xs sm:text-sm border-border/50 hover:border-primary/50 overflow-hidden"
                >
                  <Calendar className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{format(endDate, 'MMM d, yy')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background border-border" align="start">
                <CalendarUI
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    if (date) {
                      setEndDate(date);
                      setIsEndOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Download button */}
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download Excel
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AttendanceDownload;
