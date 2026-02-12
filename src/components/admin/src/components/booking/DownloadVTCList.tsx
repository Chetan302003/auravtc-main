import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';

interface ApprovedBooking {
  slot_number: number;
  vtc_name: string;
  member_count: number;
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
      'VTC Name': b.vtc_name,
      'Member Count': b.member_count,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
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
