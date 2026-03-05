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
      slot_number: b.slot_number,
      vtc_name: b.vtc_name,
      member_count: b.member_count,
      discord_id: b.discord_id,
      contact_name: b.contact_name || '',
      contact_email: b.contact_email || '',
      created_at: b.created_at,
      slot_label: b.slot_label || '',
      slot_image: b.slot_image_url || '',
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
