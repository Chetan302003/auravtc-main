import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Clock, Users, Truck, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import SlotGrid from '@/components/booking/SlotGrid';
import BookingForm from '@/components/booking/BookingForm';
import { toast } from 'sonner';

interface TruckersMPEvent {
  id: number;
  name: string;
  slug: string;
  game: string;
  server: { id: number; name: string };
  departure: { location: string; city: string };
  arrive: { location: string; city: string };
  start_at: string;
  banner: string | null;
  description: string;
  attendances: { confirmed: number; unsure: number };
}

interface Slot {
  id: string;
  slot_number: number;
  slot_label: string | null;
  is_locked: boolean;
  locked_for: string | null;
  slot_image_url?: string | null;
  status: 'available' | 'pending' | 'booked';
  booking?: {
    vtc_name: string;
    member_count: number;
  };
}

const EventBooking = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<TruckersMPEvent | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [bookingEnabled, setBookingEnabled] = useState(true);
  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('truckersmp-vtc-events');
      if (error) throw error;
      
      const foundEvent = data.events?.find((e: TruckersMPEvent) => e.id.toString() === eventId);
      setEvent(foundEvent || null);
      
      // Check if booking is enabled for this event
      if (eventId) {
        const { data: settings } = await supabase
          .from('event_booking_settings')
          .select('booking_enabled')
          .eq('truckersmp_event_id', eventId)
          .maybeSingle();

        setBookingEnabled(settings?.booking_enabled ?? true);
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      toast.error('Failed to load event details');
    }
  };

  const fetchSlots = async () => {
    if (!eventId) return;
    
    try {
      // Fetch slots for this event
      const { data: slotsData, error: slotsError } = await supabase
        .from('event_slots')
        .select('*')
        .eq('event_id', eventId)
        .order('slot_number');

      // Fetch bookings for this event
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('slot_bookings')
        .select('*')
        .eq('event_id', eventId)
        .in('status', ['pending', 'approved']);

      if (slotsError) throw slotsError;
      if (bookingsError) throw bookingsError;

      // Generate default slots if none exist (1-20)
      let processedSlots: Slot[] = [];
      
      if (slotsData && slotsData.length > 0) {
        processedSlots = slotsData.map(slot => {
          const booking = bookingsData?.find(b => b.slot_number === slot.slot_number);
          return {
            id: slot.id,
            slot_number: slot.slot_number,
            slot_label: slot.slot_label,
            is_locked: slot.is_locked,
            locked_for: slot.locked_for,
            slot_image_url: slot.slot_image_url,
            status: slot.is_locked ? 'booked' as const : 
                   booking ? (booking.status === 'approved' ? 'booked' as const : 'pending' as const) : 
                   'available' as const,
            booking: booking ? { vtc_name: booking.vtc_name, member_count: booking.member_count } : undefined
          };
        });
      } else {
        // Create default 20 slots
        for (let i = 1; i <= 20; i++) {
          const booking = bookingsData?.find(b => b.slot_number === i);
          processedSlots.push({
            id: `temp-${i}`,
            slot_number: i,
            slot_label: null,
            is_locked: false,
            locked_for: null,
            status: booking ? (booking.status === 'approved' ? 'booked' : 'pending') : 'available',
            booking: booking ? { vtc_name: booking.vtc_name, member_count: booking.member_count } : undefined
          });
        }
      }

      setSlots(processedSlots);
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
    fetchSlots();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('slot-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'slot_bookings',
          filter: `event_id=eq.${eventId}`
        },
        () => {
          fetchSlots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const handleSlotSelect = (slotNumber: number) => {
    const slot = slots.find(s => s.slot_number === slotNumber);
    if (slot?.status === 'available') {
      setSelectedSlot(slotNumber);
      setShowForm(true);
    }
  };

  const handleBookingSuccess = () => {
    setShowForm(false);
    setSelectedSlot(null);
    fetchSlots();
    toast.success('Booking request submitted! Awaiting approval.');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  if (loading) {
    return (
      <PageTransition>
        <Layout>
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        </Layout>
      </PageTransition>
    );
  }

  if (!event) {
    return (
      <PageTransition>
        <Layout>
          <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-display font-bold">Event Not Found</h1>
            <Link to="/events">
              <Button variant="glow">Back to Events</Button>
            </Link>
          </div>
        </Layout>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Layout>
        <section className="py-16 sm:py-20 min-h-screen">
          <div className="container mx-auto px-4">
            {/* Back Button */}
            <Link to="/events" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Link>

            {/* Event Header */}
            <div className="glass-card rounded-2xl overflow-hidden mb-8">
              {event.banner && (
                <div className="relative h-48 sm:h-64 md:h-80">
                  <img 
                    src={event.banner} 
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                </div>
              )}
              
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/90 text-primary-foreground">
                    {event.game.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium border border-accent/30 bg-accent/10 text-accent">
                    {event.server.name}
                  </span>
                </div>

                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                  {event.name}
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{formatDate(event.start_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{formatTime(event.start_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{event.departure.city} → {event.arrive.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{event.attendances.confirmed} confirmed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Slot Booking Section */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Slot Grid */}
              <div className="lg:col-span-2">
                <div className="glass-card rounded-2xl p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Truck className="w-6 h-6 text-primary" />
                    <h2 className="font-display text-xl sm:text-2xl font-bold">Convoy Slots</h2>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-500" />
                      <span className="text-muted-foreground">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-yellow-500" />
                      <span className="text-muted-foreground">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-500" />
                      <span className="text-muted-foreground">Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-purple-500" />
                      <span className="text-muted-foreground">Reserved (Partner)</span>
                    </div>
                  </div>

                  {!bookingEnabled ? (
                    <div className="text-center py-12 px-4">
                      <div className="glass-card rounded-2xl p-8 border-2 border-destructive/30 bg-destructive/5">
                        <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                          <Truck className="w-8 h-8 text-destructive" />
                        </div>
                        <h3 className="font-display text-xl font-bold text-destructive mb-2">
                          Bookings Closed
                        </h3>
                        <p className="text-muted-foreground">
                          Sorry, bookings are closed for this event. Please check back later or contact management for more information.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <SlotGrid 
                      slots={slots} 
                      onSlotSelect={handleSlotSelect}
                      selectedSlot={selectedSlot}
                      eventBanner={event.banner}
                    />
                  )}
                </div>
              </div>

              {/* Booking Form */}
              <div className="lg:col-span-1">
                <div className="glass-card rounded-2xl p-6 sm:p-8 sticky top-24">
                  <h2 className="font-display text-xl font-bold mb-4">
                   {!bookingEnabled ? 'Bookings Closed' : showForm ? `Book Slot #${selectedSlot}` : 'Select a Slot'}
                  </h2>
                  
                  {!bookingEnabled ? (
                    <p className="text-muted-foreground text-sm">
                      Slot bookings are currently closed for this event. Please check back later.
                    </p>
                  ) : showForm && selectedSlot ? (
                    <BookingForm 
                      eventId={eventId!}
                      slotNumber={selectedSlot}
                      onSuccess={handleBookingSuccess}
                      onCancel={() => {
                        setShowForm(false);
                        setSelectedSlot(null);
                      }}
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Click on an available (green) slot to book it for your VTC.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </PageTransition>
  );
};

export default EventBooking;
