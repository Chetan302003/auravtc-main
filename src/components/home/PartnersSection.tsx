import { useEffect, useState, useRef } from 'react';
import { Handshake } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Partner {
  id: number;
  name: string;
  logo: string;
  slogan: string;
  website: string;
}

const METH_VTC_ID = 21222;

const PartnersSection = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('truckersmp-partners');
        
        if (error) throw error;
        
        const partnersArray = data?.response?.partners;

        if (Array.isArray(partnersArray)) {
          const mappedPartners: Partner[] = partnersArray
            .map((p: any) => {
              // Get the "other" VTC (not Meth)
              const other = p?.sender?.id !== METH_VTC_ID ? p?.sender : p?.receiver;
              
              // Filter out Meth and invalid entries
              if (!other?.id || !other?.name || other.id === METH_VTC_ID) return null;

              return {
                id: other.id,
                name: other.name,
                logo: other.logo
                  ? `https://static.truckersmp.com/images/vtc/logo/${other.logo}`
                  : 'https://static.truckersmp.com/images/vtc/default/logo.png',
                slogan: other.sub_name || '',
                website: other.website || `https://truckersmp.com/vtc/${other.id}`,
              };
            })
            .filter((p): p is Partner => p !== null);

          setPartners(mappedPartners);
        } else {
          console.log('Partners data format:', data);
          setPartners([]);
        }
      } catch (error) {
        console.error('Error fetching partners:', error);
        setPartners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // Auto-scroll animation
  useEffect(() => {
    if (!scrollRef.current || partners.length === 0) return;

    const scrollContainer = scrollRef.current;
    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5;

    const animate = () => {
      scrollPosition += scrollSpeed;
      
      // Reset when reaching half (since we duplicate the content)
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(animate);
    };

    // Start animation after a short delay
    const timeoutId = setTimeout(() => {
      animationId = requestAnimationFrame(animate);
    }, 1000);

    // Pause on hover
    const handleMouseEnter = () => cancelAnimationFrame(animationId);
    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(animate);
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [partners]);

  if (loading) {
    return (
      <section className="py-16 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="h-8 w-48 bg-muted/50 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-4 w-64 bg-muted/30 rounded mx-auto animate-pulse" />
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-card p-4 rounded-xl animate-pulse flex-shrink-0 w-48">
                <div className="w-16 h-16 bg-muted/50 rounded-full mx-auto mb-3" />
                <div className="h-4 w-24 bg-muted/30 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (partners.length === 0) {
    return (
      <section id="partners" className="py-16 bg-background/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary mb-4">
              <Handshake className="w-4 h-4" />
              <span className="font-display text-sm tracking-widest">TRUSTED PARTNERS</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Our <span className="text-primary glow-text">Partners</span>
            </h2>
            <p className="text-muted-foreground">No partners to display right now.</p>
          </div>
        </div>
      </section>
    );
  }

  // Duplicate partners for infinite scroll effect
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section id="partners" className="py-16 bg-background/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="relative z-10">
        <div className="text-center mb-10 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary mb-4">
            <Handshake className="w-4 h-4" />
            <span className="font-display text-sm tracking-widest">TRUSTED PARTNERS</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Our <span className="text-primary glow-text">Partners</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            We're proud to collaborate with these amazing virtual trucking companies
          </p>
        </div>

        {/* Horizontal scrolling carousel */}
        <div className="relative">
          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-hidden py-4 px-4"
            style={{ scrollBehavior: 'auto' }}
          >
            {duplicatedPartners.map((partner, index) => (
              <a
                key={`${partner.id}-${index}`}
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-5 rounded-xl text-center group cursor-pointer relative overflow-hidden flex-shrink-0 w-44 hover:scale-105 transition-transform duration-300"
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-primary/60 transition-colors duration-300 bg-background/50">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://static.truckersmp.com/images/vtc/default/logo.png';
                      }}
                    />
                  </div>
                  <h3 className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300 truncate">
                    {partner.name}
                  </h3>
                  {partner.slogan && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                      {partner.slogan}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
