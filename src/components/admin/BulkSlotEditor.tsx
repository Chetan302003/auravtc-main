import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Layers, Upload, Image as ImageIcon } from 'lucide-react';

interface BulkSlotEditorProps {
  eventId: string;
  slotCount: number;
  onComplete: () => void;
}

const BulkSlotEditor = ({ eventId, slotCount, onComplete }: BulkSlotEditorProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'labels' | 'images' | 'both'>('both');
  
  // Bulk text inputs - one per line format: "slot_number: value"
  const [bulkLabels, setBulkLabels] = useState('');
  const [bulkImages, setBulkImages] = useState('');
  
  // Range apply
  const [rangeFrom, setRangeFrom] = useState('1');
  const [rangeTo, setRangeTo] = useState(slotCount.toString());
  const [rangeImage, setRangeImage] = useState('');
  const [rangeLabel, setRangeLabel] = useState('');

  const parseLineEntries = (text: string): Map<number, string> => {
    const entries = new Map<number, string>();
    text.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      // Support formats: "1: Label", "1 - Label", "1 Label", "1,Label"
      const match = trimmed.match(/^(\d+)\s*[:\-,]?\s*(.+)$/);
      if (match) {
        const slotNum = parseInt(match[1]);
        const value = match[2].trim();
        if (slotNum >= 1 && slotNum <= slotCount) {
          entries.set(slotNum, value);
        }
      }
    });
    return entries;
  };

  const handleBulkApply = async () => {
    setLoading(true);
    try {
      const labelEntries = mode !== 'images' ? parseLineEntries(bulkLabels) : new Map();
      const imageEntries = mode !== 'labels' ? parseLineEntries(bulkImages) : new Map();

      if (labelEntries.size === 0 && imageEntries.size === 0) {
        toast.error('No valid entries found. Use format: "1: value" per line');
        setLoading(false);
        return;
      }

      // Collect all unique slot numbers
      const allSlots = new Set([...labelEntries.keys(), ...imageEntries.keys()]);
      
      const upserts = Array.from(allSlots).map(slotNum => ({
        event_id: eventId,
        slot_number: slotNum,
        slot_label: labelEntries.get(slotNum) || null,
        slot_image_url: imageEntries.get(slotNum) || null,
        is_locked: false,
        locked_for: null,
      }));

      // Fetch existing slots to merge data
      const { data: existing } = await supabase
        .from('event_slots')
        .select('*')
        .eq('event_id', eventId)
        .in('slot_number', Array.from(allSlots));

      const mergedUpserts = upserts.map(u => {
        const ex = existing?.find(e => e.slot_number === u.slot_number);
        return {
          ...u,
          id: ex?.id || undefined,
          slot_label: u.slot_label ?? ex?.slot_label ?? null,
          slot_image_url: u.slot_image_url ?? ex?.slot_image_url ?? null,
          is_locked: ex?.is_locked ?? false,
          locked_for: ex?.locked_for ?? null,
        };
      });

      const { error } = await supabase
        .from('event_slots')
        .upsert(mergedUpserts, { onConflict: 'event_id,slot_number', ignoreDuplicates: false });

      if (error) throw error;

      toast.success(`Updated ${mergedUpserts.length} slots`);
      setOpen(false);
      onComplete();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update slots');
    } finally {
      setLoading(false);
    }
  };

  const handleRangeApply = async () => {
    const from = parseInt(rangeFrom);
    const to = parseInt(rangeTo);
    if (isNaN(from) || isNaN(to) || from < 1 || to > slotCount || from > to) {
      toast.error(`Invalid range. Must be 1-${slotCount}`);
      return;
    }
    if (!rangeImage && !rangeLabel) {
      toast.error('Enter an image URL or label to apply');
      return;
    }

    setLoading(true);
    try {
      // Fetch existing slots in range
      const { data: existing } = await supabase
        .from('event_slots')
        .select('*')
        .eq('event_id', eventId)
        .gte('slot_number', from)
        .lte('slot_number', to);

      const upserts = [];
      for (let i = from; i <= to; i++) {
        const ex = existing?.find(e => e.slot_number === i);
        upserts.push({
          id: ex?.id || undefined,
          event_id: eventId,
          slot_number: i,
          slot_label: rangeLabel || ex?.slot_label || null,
          slot_image_url: rangeImage || ex?.slot_image_url || null,
          is_locked: ex?.is_locked ?? false,
          locked_for: ex?.locked_for ?? null,
        });
      }

      const { error } = await supabase
        .from('event_slots')
        .upsert(upserts, { onConflict: 'event_id,slot_number', ignoreDuplicates: false });

      if (error) throw error;

      toast.success(`Applied to slots ${from}-${to}`);
      setOpen(false);
      onComplete();
    } catch (error: any) {
      toast.error(error.message || 'Failed to apply range update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          <Layers className="w-3 h-3 mr-1" />
          Bulk Edit Slots
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Bulk Slot Editor
          </DialogTitle>
          <DialogDescription>
            Edit labels and images for multiple slots at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode selector */}
          <div className="flex rounded-lg border border-border/30 overflow-hidden">
            {(['both', 'labels', 'images'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 px-3 py-2 text-xs font-medium capitalize transition-colors ${
                  mode === m
                    ? 'bg-primary/20 text-primary'
                    : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Per-slot entries */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Per-Slot Assignment</h4>
            <p className="text-xs text-muted-foreground">
              One entry per line. Format: <code className="bg-muted px-1 rounded">slot_number: value</code>
            </p>

            {mode !== 'images' && (
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center gap-1">
                  <Upload className="w-3 h-3" /> Labels
                </label>
                <Textarea
                  placeholder={`1: VIP\n2: Partner A\n3: Special`}
                  value={bulkLabels}
                  onChange={e => setBulkLabels(e.target.value)}
                  rows={4}
                  className="text-xs font-mono"
                />
              </div>
            )}

            {mode !== 'labels' && (
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> Image URLs
                </label>
                <Textarea
                  placeholder={`1: https://i.ibb.co/abc123/slot1.png\n2: https://drive.google.com/...`}
                  value={bulkImages}
                  onChange={e => setBulkImages(e.target.value)}
                  rows={4}
                  className="text-xs font-mono"
                />
              </div>
            )}

            <Button
              onClick={handleBulkApply}
              disabled={loading}
              size="sm"
              className="w-full"
            >
              {loading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
              Apply Per-Slot Changes
            </Button>
          </div>

          <div className="border-t border-border/30" />

          {/* Range apply */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Apply to Range</h4>
            <p className="text-xs text-muted-foreground">
              Apply the same image/label to a range of slots.
            </p>

            <div className="flex gap-2">
              <div className="space-y-1 flex-1">
                <label className="text-xs text-muted-foreground">From</label>
                <Input
                  type="number"
                  min={1}
                  max={slotCount}
                  value={rangeFrom}
                  onChange={e => setRangeFrom(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1 flex-1">
                <label className="text-xs text-muted-foreground">To</label>
                <Input
                  type="number"
                  min={1}
                  max={slotCount}
                  value={rangeTo}
                  onChange={e => setRangeTo(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Label (optional)</label>
              <Input
                placeholder="e.g. General"
                value={rangeLabel}
                onChange={e => setRangeLabel(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Image URL (optional)</label>
              <Input
                placeholder="https://..."
                value={rangeImage}
                onChange={e => setRangeImage(e.target.value)}
                className="text-xs"
              />
            </div>

            <Button
              onClick={handleRangeApply}
              disabled={loading}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {loading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
              Apply to Range
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkSlotEditor;
