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
  const [events, setEvents] = useState<TruckersMPEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendingEvents, setAttendingEvents] = useState<TruckersMPEvent[]>([]);

  const fetchEvents = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      // Fetch both hosted and attending events simultaneously
      const [hostedResponse, attendingResponse] = await Promise.all([
        supabase.functions.invoke('truckersmp-events'),
        supabase.functions.invoke('truckersmp-events-attending')
      ]);

      if (hostedResponse.error) throw hostedResponse.error;
      if (attendingResponse.error) throw attendingResponse.error;

      setEvents(hostedResponse.data.events || []);
      // Limit to 6 attending events 
      setAttendingEvents((attendingResponse.data.events || []).slice(0, 6));
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      if (!isRefresh) setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
   fetchEvents();
    
      // Auto-refresh every 60 seconds
    const interval = setInterval(() => fetchEvents(true), 60000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  return (
    <PageTransition>
    <Layout>
      <section className="py-24 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16 space-y-4 animate-slide-up">
              <span className="px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary font-display text-sm tracking-widest inline-block">
              JOIN THE ACTION
            </span>
            <h1 className="font-display text-5xl md:text-6xl font-bold">
              <span className="text-foreground">Upcoming </span>
              <span className="text-primary glow-text">Events</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Participate in our organized convoys and special events
            </p>
            <div className="neon-line max-w-xs mx-auto" />
          </div>

         {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="ml-3 text-muted-foreground">Loading events...</span>
            </div>
          )}
          
          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h3 className="font-display text-2xl font-bold mb-2">Error Loading Events</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          )}

          {/* Events Grid - 2x3 layout */}
          {!loading && !error && events.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className="group glass-card rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 hover:glow-border animate-slide-up flex flex-col hover:-translate-y-2"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Event Banner */}
                  <div className="relative aspect-video md:aspect-auto overflow-hidden bg-secondary/30">
                    <img 
                      src={event.banner || 'https://truckersmp.com/assets/images/default_event_banner.jpg'} 
                      alt={event.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-primary text-primary-foreground uppercase tracking-tighter">
                        {event.game.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-3 flex-1">
                    <h3 className="font-display text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {event.name}
                    </h3>
                    
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium border bg-accent/10 text-accent border-accent/30">
                      {event.server.name}
                    </span>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{formatDate(event.start_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{formatTime(event.start_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="truncate">{event.departure.city} → {event.arrive.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{event.attendances.confirmed} confirmed</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 pb-6 pt-0 mb-3 flex flex-col gap-1">
                    <Link to={`/events/${event.id}/book`} className="w-full block">
                     <Button variant="glow" className="w-full text-sm">
                      <Ticket className="w-4 h-4 mr-2" />
                        Book Slot
                       </Button>
                      </Link>
                    <a
                      href={`https://truckersmp.com/events/${event.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button variant="glow" className="w-full">
                        View Event
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Section Divider */}
          {!loading && !error && attendingEvents.length > 0 && (
            <div className="mt-32 mb-16 space-y-4 text-center animate-slide-up">
              <span className="px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary font-display text-sm tracking-widest inline-block uppercase">
                VTC Participation
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold">
                Events We're <span className="text-primary glow-text">Attending</span>
              </h2>
              <div className="neon-line max-w-xs mx-auto" />
            </div>
          )}

          {/* Attending Events Grid */}
          {!loading && !error && attendingEvents.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto"> 
              {attendingEvents.map((event, index) => (
                <div
                  key={`attending-${event.id}`}
                  className="group glass-card rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 hover:glow-border animate-slide-up flex flex-col hover:-translate-y-2"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                   {/* Attending Event Banner */}
                  <div className="relative aspect-video md:aspect-auto overflow-hidden bg-secondary/30">
                    <img 
                      src={event.banner || 'https://truckersmp.com/assets/images/default_event_banner.jpg'} 
                      alt={event.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-primary text-primary-foreground uppercase tracking-tighter">
                        Attending
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1 space-y-4">
                    <h3 className="font-display text-lg font-bold text-foreground line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
                      {event.name}
                    </h3>

                    <div className="space-y-2 text-[13px]">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate">{formatDate(event.start_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary shrink-0" />
                        <span>{formatTime(event.start_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate">{event.departure.city} → {event.arrive.city}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 mt-auto">
                      <a href={`https://truckersmp.com/events/${event.slug}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="glow" className="w-full text-xs font-bold uppercase tracking-widest">
                          Event Link <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Events Fallback */}
          {!loading && !error && events.length === 0 && (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-2xl font-bold mb-2">No Upcoming Events</h3>
              <p className="text-muted-foreground">Check back soon for new convoy announcements!</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
    </PageTransition>
  );
};

export default Events;
