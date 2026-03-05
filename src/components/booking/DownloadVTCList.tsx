import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';

interface ApprovedBooking {
  // From slot_bookings table
  slot_number: number;
  vtc_name: string;
  member_count: number;
  discord_id: string;
  contact_name?: string | null;
  contact_email?: string | null;
  notes?: string | null;
  created_at: string;
  // Joined from event_slots
  slot_image_url?: string | null;
  slot_label?: string | null;
}

interface DownloadVTCListProps {
  eventName: string;
  approvedBookings: ApprovedBooking[];
}

const DownloadVTCList = ({ eventName, approvedBookings }: DownloadVTCListProps) => {
  const handleDownload = () => {
    if (approvedBookings.length === 0) return;

    const data = approvedBookings.map((b) => ({
      'Slot #': b.slot_number,
      'Slot Label': b.slot_label || '',
      'VTC Name': b.vtc_name,
      'Member Count': b.member_count,
      'Contact Name': b.contact_name || '',
      'Contact Email': b.contact_email || '',
      'Discord ID': b.discord_id,
      'Notes': b.notes || '',
      'Booked At': new Date(b.created_at).toLocaleString('en-GB'),
      'Slot Image URL': b.slot_image_url || '',
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    // Auto-width columns
    const colWidths = Object.keys(data[0] || {}).map((key) => ({
      wch: Math.max(key.length, ...data.map((row) => String(row[key as keyof typeof row] ?? '').length)),
    }));
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Confirmed VTCs');

    const safeName = eventName.replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');
    XLSX.writeFile(wb, `${safeName}_Confirmed_VTCs.xlsx`);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={approvedBookings.length === 0}
      className="gap-2"
    >
      <Download className="w-4 h-4" />
      Download List
    </Button>
  );
};

export default DownloadVTCList;
