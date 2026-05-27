import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { X } from 'lucide-react';

interface Slot {
  id: string;
  slot_number: number;
  slot_label: string | null;
  is_locked: boolean;
  locked_for: string | null;
  status: 'available' | 'pending' | 'booked';
  slot_image_url?: string | null;
  booking?: {
    vtc_name: string;
    member_count: number;
  };
}

interface SlotGridProps {
  slots: Slot[];
  onSlotSelect: (slotNumber: number) => void;
  selectedSlot: number | null;
  eventBanner?: string | null;
}

// Convert Google Drive link to direct image URL
const convertToDirectImageUrl = (url: string): string => {
  if (!url) return '';

  try {
    const host = new URL(url).hostname;

    if (host === 'drive.google.com') {
      const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch) {
        return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w800`;
      }
    }
  } catch {
    return url; // Invalid URL, return as-is
  }

  // Return original URL for ImageBB and other direct links
  return url;
};


const SlotGrid = ({ slots, onSlotSelect, selectedSlot, eventBanner }: SlotGridProps) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const getStatusOverlay = (slot: Slot) => {
    switch (slot.status) {
      case 'pending':
        return 'bg-yellow-500/20 border-yellow-500/50';
      case 'booked':
        return 'bg-red-500/20 border-red-500/50';
      default:
        return 'bg-green-500/10 border-green-500/30 group-hover:border-green-500/60';
    }
  };

  const getStatusBadge = (slot: Slot) => {
    if (slot.is_locked) return { label: 'Reserved', color: 'bg-purple-500' };
    switch (slot.status) {
      case 'pending':
        return { label: 'Pending Approval', color: 'bg-yellow-500' };
      case 'booked':
        return { label: 'Booked', color: 'bg-red-500' };
      default:
        return { label: 'Available', color: 'bg-green-500' };
    }
  };

  const getSlotImage = (slot: Slot): string | null => {
    const url = slot.slot_image_url || eventBanner || null;
    return url ? convertToDirectImageUrl(url) : null;
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {slots.map((slot) => {
          const slotImage = getSlotImage(slot);
          const status = getStatusBadge(slot);
          const isAvailable = slot.status === 'available' && !slot.is_locked;

          return (
            <div
              key={slot.id}
              className={cn(
                "group relative aspect-video rounded-xl overflow-hidden transition-all duration-300 border-2 bg-muted/20",
                getStatusOverlay(slot),
                selectedSlot === slot.slot_number && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]",
                isAvailable ? "cursor-pointer hover:scale-[1.01]" : "cursor-not-allowed"
              )}
              onClick={() => isAvailable && onSlotSelect(slot.slot_number)}
            >
              {/* Background Image */}
              {slotImage ? (
                <img
                  src={slotImage}
                  alt={slot.slot_label || `Slot ${slot.slot_number}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <span className="text-4xl font-bold opacity-20">{slot.slot_number}</span>
                </div>
              )}

              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Branding Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <div className="bg-primary/90 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded text-white tracking-widest uppercase">
                  Aura Events
                </div>
                {/* {slot.is_locked && (
                  <div className="bg-purple-600/90 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded text-white tracking-widest uppercase">
                    Reserved
                  </div>
                )} */}
              </div>

              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <div className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase",
                  status.color
                )}>
                  {status.label}
                </div>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-bold text-white drop-shadow-md">
                  {slot.slot_label || `Slot ${slot.slot_number}`}
                </h3>
                <p className="text-xs text-white/70 font-medium">
                  {slot.booking ? slot.booking.vtc_name : (isAvailable ? 'Click to book this slot' : 'Reserved')}
                </p>
              </div>

              {/* Selection Indicator & View Image Button */}
              {slotImage && (
                <div className={cn(
                  "absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center",
                  !isAvailable && "bg-black/40"
                )}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImage(slotImage);
                    }}
                    className="bg-white/20 backdrop-blur-xl border border-white/30 text-emerald-950 font-bold px-4 py-2 rounded-lg shadow-2xl translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-white/40 active:scale-95"
                  >
                    View Image
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Full Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0 border-primary/30 bg-background/95 backdrop-blur-xl">
          <DialogTitle className="sr-only">Slot Preview Image</DialogTitle>
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-background/80 border border-primary/30 flex items-center justify-center text-foreground hover:bg-primary/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {previewImage && (
            <div className="relative aspect-video w-full">
              <img
                src={previewImage}
                alt="Slot preview"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SlotGrid;


// import { cn } from '@/lib/utils';
// import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
// import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
// import { useState } from 'react';
// import { X } from 'lucide-react';

// interface Slot {
//   id: string;
//   slot_number: number;
//   slot_label: string | null;
//   is_locked: boolean;
//   locked_for: string | null;
//   status: 'available' | 'pending' | 'booked';
//   slot_image_url?: string | null;
//   booking?: {
//     vtc_name: string;
//     member_count: number;
//   };
// }

// interface SlotGridProps {
//   slots: Slot[];
//   onSlotSelect: (slotNumber: number) => void;
//   selectedSlot: number | null;
//   eventBanner?: string | null;
// }

// // Convert Google Drive link to direct image URL
// const convertToDirectImageUrl = (url: string): string => {
//   if (!url) return '';
  
//   // Handle Google Drive links
//   if (url.includes('drive.google.com')) {
//     const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
//     if (fileIdMatch) {
//       return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w800`;
//     }
//   }
  
//   // Return original URL for ImageBB and other direct links
//   return url;
// };


// const SlotGrid = ({ slots, onSlotSelect, selectedSlot, eventBanner }: SlotGridProps) => {
//   const [previewImage, setPreviewImage] = useState<string | null>(null);

//   const getSlotColor = (slot: Slot) => {
//     if (slot.is_locked) return 'bg-purple-500 hover:bg-purple-600';
//     switch (slot.status) {
//       case 'available':
//         return 'bg-green-500 hover:bg-green-600 cursor-pointer';
//       case 'pending':
//         return 'bg-yellow-500 hover:bg-yellow-600';
//       case 'booked':
//         return 'bg-red-500 hover:bg-red-600';
//       default:
//         return 'bg-muted';
//     }
//   };

//   const getTooltipContent = (slot: Slot) => {
//     if (slot.is_locked && slot.locked_for) {
//       return `Reserved for ${slot.locked_for}`;
//     }
//     if (slot.booking) {
//       return `${slot.booking.vtc_name} (${slot.booking.member_count} members)${slot.status === 'pending' ? ' - Pending Approval' : ''}`;
//     }
//     return slot.slot_label || `Slot ${slot.slot_number} - Available`;
//   };

//   const getSlotImage = (slot: Slot): string | null => {
//     const url = slot.slot_image_url || eventBanner || null;
//     return url ? convertToDirectImageUrl(url) : null;
//   };

//   return (
//     <>
//       <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
//         {slots.map((slot) => {
//           const slotImage = getSlotImage(slot);
          
//           return (
//             <Tooltip key={slot.id}>
//               <TooltipTrigger asChild>
//                 <button
//                   onClick={() => onSlotSelect(slot.slot_number)}
//                   onMouseEnter={(e) => {
//                     if (slotImage) {
//                       // Show preview on hover
//                       const rect = e.currentTarget.getBoundingClientRect();
//                     }
//                   }}
//                   onContextMenu={(e) => {
//                     e.preventDefault();
//                     if (slotImage) {
//                       setPreviewImage(slotImage);
//                     }
//                   }}
//                   disabled={slot.status !== 'available'}
//                   className={cn(
//                     'relative aspect-square rounded-lg font-display font-bold text-white transition-all duration-200 flex items-center justify-center text-lg sm:text-xl group',
//                     getSlotColor(slot),
//                     selectedSlot === slot.slot_number && 'ring-2 ring-white ring-offset-2 ring-offset-background scale-105',
//                     slot.status !== 'available' && 'cursor-not-allowed opacity-90'
//                   )}
//                 >
//                   {slot.slot_label || slot.slot_number}
                  
//                   {/* Hover preview indicator */}
//                   {slotImage && (
//                     <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
//                       <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
//                         <span className="text-[10px]">📷</span>
//                       </div>
//                     </div>
//                   )}
//                 </button>
//               </TooltipTrigger>
//               <TooltipContent side="top" className="max-w-xs">
//                 <div className="space-y-2">
//                   <p className="font-medium">{getTooltipContent(slot)}</p>
//                   {slotImage && (
//                     <div className="rounded overflow-hidden">
//                       <img
//                         src={slotImage}
//                         alt={`Slot ${slot.slot_number} preview`}
//                         className="w-48 h-28 object-cover"
//                       />
//                       <p className="text-[10px] text-muted-foreground mt-1">Right-click to enlarge</p>
//                     </div>
//                   )}
//                 </div>
//               </TooltipContent>
//             </Tooltip>
//           );
//         })}
//       </div>

//       {/* Full Image Preview Dialog */}
//       <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
//         <DialogContent className="max-w-4xl w-full p-0 border-primary/30 bg-background/95 backdrop-blur-xl">
//           <DialogTitle className="sr-only">Slot Preview Image</DialogTitle>
//           <button
//             onClick={() => setPreviewImage(null)}
//             className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-background/80 border border-primary/30 flex items-center justify-center text-foreground hover:bg-primary/20 transition-colors"
//           >
//             <X className="w-5 h-5" />
//           </button>
          
//           {previewImage && (
//             <div className="relative aspect-video w-full">
//               <img
//                 src={previewImage}
//                 alt="Slot preview"
//                 className="w-full h-full object-contain"
//               />
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// export default SlotGrid;
