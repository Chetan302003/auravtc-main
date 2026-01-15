import { Calendar, MapPin, Clock, Users, ExternalLink, Loader2, Truck, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TruckersMPEvent {
  id: number;
  name: string;
  slug: string;
  game: string;
  server: { id: number; name: string };
  language: string;
  departure: { location: string; city: string };
  arrive: { location: string; city: string };
  start_at: string;
  banner: string | null;
  map: string | null;
  description: string;
  rule: string;
  voice_link: string | null;
  external_link: string | null;
  featured: string | null;
  vtc: { id: number; name: string };
  user: { id: number; username: string };
  attendances: { confirmed: number; unsure: number };
  dlcs: { required: boolean; dlcs: string[] };
  created_at: string;
  updated_at: string;
}

const Events = () => {
  const [vtcEvents, setVtcEvents] = useState<TruckersMPEvent[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<TruckersMPEvent[]>([]);
  const [loadingVtc, setLoadingVtc] = useState(true);
  const [loadingAttending, setLoadingAttending] = useState(true);
  const [errorVtc, setErrorVtc] = useState<string | null>(null);
  const [errorAttending, setErrorAttending] = useState<string | null>(null);

  const fetchVtcEvents = async (isRefresh = false) => {
    if (!isRefresh) setLoadingVtc(true);
    try {
      const { data, error } = await supabase.functions.invoke('truckersmp-vtc-events');
      
      if (error) throw error;
      
      setVtcEvents(data.events || []);
      setErrorVtc(null);
    } catch (err) {
      console.error('Error fetching VTC events:', err);
      if (!isRefresh) setErrorVtc('Failed to load VTC events');
    } finally {
      setLoadingVtc(false);
    }
  };

  const fetchAttendingEvents = async (isRefresh = false) => {
    if (!isRefresh) setLoadingAttending(true);
    try {
      const { data, error } = await supabase.functions.invoke('truckersmp-events');
      
      if (error) throw error;
      
      setAttendingEvents(data.events || []);
      setErrorAttending(null);
    } catch (err) {
      console.error('Error fetching attending events:', err);
      if (!isRefresh) setErrorAttending('Failed to load attending events');
    } finally {
      setLoadingAttending(false);
    }
  };

  useEffect(() => {
    fetchVtcEvents();
    fetchAttendingEvents();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchVtcEvents(true);
      fetchAttendingEvents(true);
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  const EventCard = ({ event, index, isVtcEvent = false }: { event: TruckersMPEvent; index: number; isVtcEvent?: boolean }) => (
    <div
      key={event.id}
      className="group glass-card rounded-xl sm:rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 hover:glow-border animate-slide-up flex flex-col hover:-translate-y-2"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Event Banner */}
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={event.banner || 'https://truckersmp.com/assets/images/default_event_banner.jpg'} 
          alt={event.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <span className="px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-primary/90 text-primary-foreground font-display">
            {event.game.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="p-4 sm:p-5 space-y-2 sm:space-y-3 flex-1">
        <h3 className="font-display text-sm sm:text-base lg:text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors break-words">
          {event.name}
        </h3>
        
        <span className="inline-block px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium border bg-accent/10 text-accent border-accent/30">
          {event.server.name}
        </span>
        
        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
            <span className="truncate">{formatDate(event.start_at)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
            <span className="truncate">{formatTime(event.start_at)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
            <span className="truncate">{event.departure.city} → {event.arrive.city}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
            <span>{event.attendances.confirmed} confirmed</span>
          </div>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 space-y-3">
        {/* Book Slot Button - Only for VTC Events */}
        {isVtcEvent && (
          <Link to={`/events/${event.id}/book`} className="w-full block">
            <Button variant="glow" className="w-full text-sm">
              <Ticket className="w-3 h-3 sm:w-4 sm:h-4" />
              Book Slot
            </Button>
          </Link>
        )}
        
        {/* View on TruckersMP */}
        <a
          href={`https://truckersmp.com/events/${event.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full block"
        >
          <Button variant={isVtcEvent ? "outline" : "glow"} className="w-full text-sm">
            View on TruckersMP
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </a>
      </div>
    </div>
  );

  const EventsSection = ({ 
    title, 
    subtitle, 
    events, 
    loading, 
    error, 
    icon: Icon,
    isVtcEvent = false
  }: { 
    title: string; 
    subtitle: string; 
    events: TruckersMPEvent[]; 
    loading: boolean; 
    error: string | null;
    icon: React.ComponentType<{ className?: string }>;
    isVtcEvent?: boolean;
  }) => (
    <div className="mb-12 sm:mb-16">
      {/* Section Header */}
      <div className="text-center mb-6 sm:mb-10 space-y-2 sm:space-y-3 animate-slide-up">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
            <span className="text-primary glow-text">{title}</span>
          </h2>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-4">{subtitle}</p>
        <div className="neon-line max-w-xs mx-auto" />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12 sm:py-16">
          <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-spin" />
          <span className="ml-3 text-sm sm:text-base text-muted-foreground">Loading events...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12 sm:py-16">
          <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-destructive mx-auto mb-3" />
          <h3 className="font-display text-lg sm:text-xl font-bold mb-2">Error Loading Events</h3>
          <p className="text-sm sm:text-base text-muted-foreground">{error}</p>
        </div>
      )}

      {/* Events Grid */}
      {!loading && !error && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {events.map((event, index) => (
            <EventCard key={event.id} event={event} index={index} isVtcEvent={isVtcEvent} />
          ))}
        </div>
      )}

      {/* No Events Fallback */}
      {!loading && !error && events.length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-display text-lg sm:text-xl font-bold mb-2">No Upcoming Events</h3>
          <p className="text-sm sm:text-base text-muted-foreground">Check back soon for new announcements!</p>
        </div>
      )}
    </div>
  );

  return (
    <PageTransition>
    <Layout>
      <section className="py-16 sm:py-20 md:py-24 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-16 space-y-3 sm:space-y-4 animate-slide-up">
            <span className="px-3 sm:px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary font-display text-xs sm:text-sm tracking-widest inline-block">
              JOIN THE ACTION
            </span>
            <h1 className="font-display text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold">
              <span className="text-foreground">Upcoming </span>
              <span className="text-primary glow-text">Events</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Participate in our organized convoys and special events
            </p>
            <div className="neon-line max-w-xs mx-auto" />
          </div>

          {/* Our VTC Events Section */}
          <EventsSection
            title="Our VTC Events"
            subtitle="Events organized and hosted by Aura VTC - Book your convoy slot!"
            events={vtcEvents}
            loading={loadingVtc}
            error={errorVtc}
            icon={Truck}
            isVtcEvent={true}
          />

          {/* Events We're Attending Section */}
          <EventsSection
            title="Events We're Attending"
            subtitle="Join us at these community events"
            events={attendingEvents}
            loading={loadingAttending}
            error={errorAttending}
            icon={Users}
          />
        </div>
      </section>
    </Layout>
    </PageTransition>
  );
};

export default Events;
