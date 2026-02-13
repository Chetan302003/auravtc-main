import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const bookingSchema = z.object({
  discord_id: z.string()
    .min(17, 'Discord ID must be at least 17 characters')
    .max(20, 'Discord ID must be at most 20 characters')
    .regex(/^\d+$/, 'Discord ID must contain only numbers'),
  vtc_name: z.string()
    .min(2, 'VTC name must be at least 2 characters')
    .max(100, 'VTC name must be at most 100 characters'),
  contact_name: z.string()
    .min(2, 'Contact name must be at least 2 characters')
    .max(50, 'Contact name must be at most 50 characters'),
  contact_email: z.string()
    .email('Please enter a valid email address')
    .or(z.literal('')),
  member_count: z.coerce.number()
    .min(4, 'Minimum 4 members required')
    .max(100, 'Maximum 100 members allowed'),
  notes: z.string().max(500, 'Notes must be at most 500 characters').optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  eventId: string;
  slotNumber: number;
  eventName?: string;
  eventSlug?: string;
  eventBanner?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const BookingForm = ({ eventId, slotNumber, eventName, eventSlug, eventBanner, onSuccess, onCancel }: BookingFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      member_count: 4,
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    setSubmitting(true);

    try {
      // First, insert the booking with email
      const { data: booking, error: bookingError } = await supabase
        .from('slot_bookings')
        .insert({
          event_id: eventId,
          slot_number: slotNumber,
          discord_id: data.discord_id,
          vtc_name: data.vtc_name,
          contact_name: data.contact_name,
          contact_email: data.contact_email,
          member_count: data.member_count,
          notes: data.notes || null,
          status: 'pending',
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Send Discord webhook notification
      const { error: webhookError } = await supabase.functions.invoke('discord-booking-webhook', {
        body: {
          booking_id: booking.id,
          event_id: eventId,
          slot_number: slotNumber,
          event_name: eventName,
          event_slug: eventSlug,
          event_banner: eventBanner,
          vtc_name: data.vtc_name,
          discord_id: data.discord_id,
          contact_email: data.contact_email,
          contact_name: data.contact_name,
          member_count: data.member_count,
          notes: data.notes,
        },
      });

      if (webhookError) {
        console.error('Webhook error:', webhookError);
        // Don't fail the booking if webhook fails
      }

      setShowConfirmation(true);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
        <>
    <Dialog open={showConfirmation} onOpenChange={(open) => {
      if (!open) {
        setShowConfirmation(false);
        onSuccess();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Booking Submitted!
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Your slot booking request has been submitted successfully. You will receive a confirmation on:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/30">
              <MessageCircle className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm">Your <strong>Discord ID</strong> via Direct Message</span>
            </div>
            {watch('contact_email') && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/30">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-sm">Your <strong>email</strong> ({watch('contact_email')})</span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm font-medium text-primary">⚡ Important!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Please join our Discord server for a quicker response and real-time updates on your booking status.
            </p>
            <a
              href="https://discord.com/invite/auravtc"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-primary hover:underline"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Join our Discord Server
            </a>
          </div>
          <Button variant="glow" className="w-full" onClick={() => {
            setShowConfirmation(false);
            onSuccess();
          }}>
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="vtc_name">VTC Name *</Label>
        <Input
          id="vtc_name"
          placeholder="Your VTC Name"
          {...register('vtc_name')}
          className={errors.vtc_name ? 'border-destructive' : ''}
        />
        {errors.vtc_name && (
          <p className="text-xs text-destructive">{errors.vtc_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="discord_id">Discord User ID *</Label>
        <Input
          id="discord_id"
          placeholder="123456789012345678"
          {...register('discord_id')}
          className={errors.discord_id ? 'border-destructive' : ''}
        />
        {errors.discord_id && (
          <p className="text-xs text-destructive">{errors.discord_id.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Enable Developer Mode in Discord, right-click your profile → Copy User ID
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_name">Contact Name *</Label>
        <Input
          id="contact_name"
          placeholder="Your name or Discord username"
          {...register('contact_name')}
          className={errors.contact_name ? 'border-destructive' : ''}
        />
        {errors.contact_name && (
          <p className="text-xs text-destructive">{errors.contact_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_email">Contact Email </Label>
        <Input
          id="contact_email"
          type="email"
          placeholder="you@example.com"
          {...register('contact_email')}
          className={errors.contact_email ? 'border-destructive' : ''}
        />
        {errors.contact_email && (
          <p className="text-xs text-destructive">{errors.contact_email.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          We'll notify you via email when your booking is approved/rejected
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="member_count">Number of Members *</Label>
        <Input
          id="member_count"
          type="number"
          min={4}
          max={100}
          {...register('member_count')}
          className={errors.member_count ? 'border-destructive' : ''}
        />
        {errors.member_count && (
          <p className="text-xs text-destructive">{errors.member_count.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Minimum 4 members required for slot booking
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any special requests or information..."
          rows={3}
          {...register('notes')}
          className={errors.notes ? 'border-destructive' : ''}
        />
        {errors.notes && (
          <p className="text-xs text-destructive">{errors.notes.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="glow"
          disabled={submitting}
          className="flex-1"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            'Submit Booking'
          )}
        </Button>
      </div>
    </form>
           </>
  );
};

export default BookingForm;
