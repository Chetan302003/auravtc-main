import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40 animate-float"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 4) * 15}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${4 + i * 0.5}s`,
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 animate-bounce-subtle">
            <Sparkles className="w-4 h-4 text-primary animate-pulse-glow" />
            <span className="text-primary font-display text-sm tracking-wider">JOIN THE ADVENTURE</span>
          </div>

          <h2 className="font-display text-4xl md:text-6xl font-bold animate-slide-up">
            <span className="text-foreground">Ready to Hit the </span>
            <span className="text-primary glow-text-strong animate-pulse-glow">Road?</span>
          </h2>

          <p className="text-xl text-muted-foreground max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Become part of our growing family. Apply now and start your journey with Meth VTC on TruckersMP.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <Link to="/apply">
              <Button variant="hero" size="xl" className="w-full sm:w-auto group">
                Apply Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="heroOutline" size="xl" className="w-full sm:w-auto hover:scale-105 transition-transform">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
