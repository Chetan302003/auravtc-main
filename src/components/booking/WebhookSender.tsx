import { useState } from 'react';
import { Send, Loader2, Webhook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Slot {
  slot_number: number;
  slot_label: string | null;
  is_locked: boolean;
  locked_for: string | null;
  slot_image_url?: string | null;
  status: 'available' | 'pending' | 'booked';
  booking?: {
    vtc_name: string;
    vtc_id?: number;
    member_count: number;
  };
}

interface EventData {
  id: number;
  name: string;
  game: string;
  server: { id: number; name: string };
  departure: { location: string; city: string };
  arrive: { location: string; city: string };
  start_at: string;
  banner: string | null;
  attendances: { confirmed: number; unsure: number };
}

interface WebhookSenderProps {
  event: EventData;
  slots: Slot[];
}

const WebhookSender = ({ event, slots }: WebhookSenderProps) => {
  const [open, setOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!webhookUrl.trim()) {
      toast.error('Please enter a webhook URL');
      return;
    }

    try {
      new URL(webhookUrl);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setSending(true);

    const eventUrl = `https://truckersmp.com/events/${event.id}`;
    const ticketUrl = `https://truckersmp.com/events/${event.id}`; // replace with actual ticket URL if available

    // Intro embed — matches Image 2 style
    const introEmbed = {
      title: event.name,
      url: eventUrl,
      description: [
        `Welcome and thank you for your interest in [**${event.name}**](${eventUrl}).`,
        ``,
        `Please select the suitable slot and open an [**Event Team Ticket**](${ticketUrl}) to book a slot for your VTC containing the following information:`,
        ``,
        `1) Name of the VTC`,
        `2) Desired Slot`,
        `3) Estimated number of attendees`,
        `4) Position within your VTC`,
        ``,
        `Slot bookings are updated as soon as a booking has been confirmed so please ensure the slot you wish to book is vacant and is not booked by any other VTC.`,
      ].join('\n'),
      color: 0x1f8b4c,
      footer: {
        text: `The Event Team of Aura • ${new Date().toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        icon_url: event.banner || undefined,
      },
    };

    // Group slots by slot_label — preserving insertion order
    const groups = new Map<string, { slots: Slot[]; imageUrl: string | null }>();

    slots.forEach((s) => {
      const label = s.slot_label || `Slot #${s.slot_number}`;
      if (!groups.has(label)) {
        groups.set(label, { slots: [], imageUrl: s.slot_image_url || event.banner || null });
      }
      groups.get(label)!.slots.push(s);
    });

    const slotEmbeds: object[] = [];

    groups.forEach((group, label) => {
      // Build bullet list matching Image 2: "• **[VTC Name](url)**" or "• Available"
      const vtcList = group.slots
        .map((s) => {
          if (s.is_locked && s.locked_for) {
            // Locked slot — bold name, link to TruckersMP search or VTC page
            return `• **[${s.locked_for}](https://truckersmp.com/vtc)** *(Reserved)*`;
          } else if (s.status === 'booked' && s.booking) {
            const vtcUrl = s.booking.vtc_id
              ? `https://truckersmp.com/vtc/${s.booking.vtc_id}`
              : `https://truckersmp.com/vtc`;
            return `• **[${s.booking.vtc_name}](${vtcUrl})**`;
          } else {
            return `• Available`;
          }
        })
        .join('\n');

      slotEmbeds.push({
        author: {
          name: event.name,
          icon_url: event.banner || undefined,
          url: eventUrl,
        },
        title: label,
        description: vtcList,
        color: 0x1f8b4c,
        image: group.imageUrl ? { url: group.imageUrl } : undefined,
      });
    });

    // Combine intro + slot embeds; Discord allows max 10 per message
    const allEmbeds = [introEmbed, ...slotEmbeds];
    const chunks: object[][] = [];
    for (let i = 0; i < allEmbeds.length; i += 10) {
      chunks.push(allEmbeds.slice(i, i + 10));
    }

    try {
      for (const chunk of chunks) {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ embeds: chunk }),
        });

        if (!res.ok && res.status !== 0) {
          throw new Error(`HTTP ${res.status}`);
        }

        if (chunks.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      toast.success('Event details sent to Discord webhook!');
      setOpen(false);
      setWebhookUrl('');
    } catch (err) {
      console.error('Webhook error:', err);
      toast.error('Failed to send webhook. Check the URL and try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Webhook className="w-4 h-4" />
          Send to Webhook
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Send Event to Webhook</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Enter a Discord webhook URL to post the full slot list with VTC links, section images, and booking status.
          </p>
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              placeholder="https://discord.com/api/webhooks/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
          </div>

          <div className="rounded-lg bg-muted/30 border border-border/30 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground text-sm">Payload format: Discord Embeds</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Intro embed with event info &amp; ticket instructions</li>
              <li>Section embeds grouped by slot label</li>
              <li>VTC names as bold hyperlinks (• <strong>VTC Name</strong>)</li>
              <li>Slot preview images included per section</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1" disabled={sending}>
              Cancel
            </Button>
            <Button variant="glow" onClick={handleSend} className="flex-1" disabled={sending}>
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WebhookSender;




// import { useState } from 'react';
// import { Send, Loader2, Webhook } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { toast } from 'sonner';

// interface Slot {
//   slot_number: number;
//   slot_label: string | null;
//   is_locked: boolean;
//   locked_for: string | null;
//   slot_image_url?: string | null;
//   status: 'available' | 'pending' | 'booked';
//   booking?: {
//     vtc_name: string;
//     member_count: number;
//   };
// }

// interface EventData {
//   id: number;
//   name: string;
//   game: string;
//   server: { id: number; name: string };
//   departure: { location: string; city: string };
//   arrive: { location: string; city: string };
//   start_at: string;
//   banner: string | null;
//   attendances: { confirmed: number; unsure: number };
// }

// interface WebhookSenderProps {
//   event: EventData;
//   slots: Slot[];
// }

// const WebhookSender = ({ event, slots }: WebhookSenderProps) => {
//   const [open, setOpen] = useState(false);
//   const [webhookUrl, setWebhookUrl] = useState('');
//   const [sending, setSending] = useState(false);

//   const handleSend = async () => {
//     if (!webhookUrl.trim()) {
//       toast.error('Please enter a webhook URL');
//       return;
//     }

//     try {
//       new URL(webhookUrl);
//     } catch {
//       toast.error('Please enter a valid URL');
//       return;
//     }

//     setSending(true);

//     const slotDetails = slots.map((s) => ({
//       slot_number: s.slot_number,
//       slot_label: s.slot_label,
//       status: s.is_locked ? 'reserved' : s.status,
//       reserved_for: s.locked_for || null,
//       slot_image_url: s.slot_image_url || null,
//       vtc_name: s.booking?.vtc_name || null,
//       member_count: s.booking?.member_count || null,
//     }));

//     const payload = {
//       event: {
//         id: event.id,
//         name: event.name,
//         game: event.game,
//         server: event.server,
//         departure: event.departure,
//         arrive: event.arrive,
//         start_at: event.start_at,
//         banner: event.banner,
//         attendances: event.attendances,
//       },
//       slots: slotDetails,
//       total_slots: slots.length,
//       booked_slots: slots.filter((s) => s.status === 'booked' || s.is_locked).length,
//       available_slots: slots.filter((s) => s.status === 'available' && !s.is_locked).length,
//       sent_at: new Date().toISOString(),
//     };

//     try {
//       await fetch(webhookUrl, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//         mode: 'no-cors',
//       });

//       toast.success('Event details sent to webhook!');
//       setOpen(false);
//       setWebhookUrl('');
//     } catch (err) {
//       console.error('Webhook error:', err);
//       toast.error('Failed to send webhook. Check the URL and try again.');
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button variant="outline" size="sm" className="gap-2">
//           <Webhook className="w-4 h-4" />
//           Send to Webhook
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle className="font-display">Send Event to Webhook</DialogTitle>
//         </DialogHeader>
//         <div className="space-y-4 pt-2">
//           <p className="text-sm text-muted-foreground">
//             Enter a webhook URL to send all event details including slot images, labels, and confirmed VTCs.
//           </p>
//           <div className="space-y-2">
//             <Label htmlFor="webhook-url">Webhook URL</Label>
//             <Input
//               id="webhook-url"
//               placeholder="https://discord.com/api/webhooks/..."
//               value={webhookUrl}
//               onChange={(e) => setWebhookUrl(e.target.value)}
//             />
//           </div>

//           <div className="rounded-lg bg-muted/30 border border-border/30 p-3 text-xs text-muted-foreground space-y-1">
//             <p className="font-medium text-foreground text-sm">Payload includes:</p>
//             <ul className="list-disc list-inside space-y-0.5">
//               <li>Event name, game, server, route</li>
//               <li>Start time &amp; attendances</li>
//               <li>All slot details (number, label, image URL, status)</li>
//               <li>Confirmed VTC names &amp; member counts</li>
//             </ul>
//           </div>

//           <div className="flex gap-3">
//             <Button variant="outline" onClick={() => setOpen(false)} className="flex-1" disabled={sending}>
//               Cancel
//             </Button>
//             <Button variant="glow" onClick={handleSend} className="flex-1" disabled={sending}>
//               {sending ? (
//                 <>
//                   <Loader2 className="w-4 h-4 animate-spin mr-2" />
//                   Sending...
//                 </>
//               ) : (
//                 <>
//                   <Send className="w-4 h-4 mr-2" />
//                   Send
//                 </>
//               )}
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default WebhookSender;
