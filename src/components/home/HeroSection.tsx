import { ArrowRight, Shield, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
const features = [{
  icon: Shield,
  label: '24/7 Support'
}, {
  icon: Star,
  label: 'Premium Experience'
}, {
  icon: Users,
  label: 'Active Community'
}];
const HeroSection = () => {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary font-display text-sm tracking-widest">
                PROFESSIONAL VIRTUAL TRUCKING
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight">
              <span className="text-foreground">AURA</span>
              <br />
              <span className="text-primary glow-text-strong">VTC</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
              Experience the future of virtual transportation with the premier trucking company on TruckersMP. Join our community of professional drivers and embark on an extraordinary journey.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/apply">
                <Button variant="hero" size="xl">
                  Join Us Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/team">
                <Button variant="heroOutline" size="xl">
                  Explore More
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 pt-4">
              {features.map(feature => {
              const Icon = feature.icon;
              return <div key={feature.label} className="flex items-center gap-2 text-muted-foreground">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{feature.label}</span>
                  </div>;
            })}
            </div>
          </div>

          {/* Logo Display */}
          <div className="relative flex justify-center animate-fade-in" style={{
          animationDelay: '0.3s'
        }}>
            <div className="relative">
              {/* Animated glow rings */}
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-3xl animate-pulse-glow" />
              <div className="absolute -inset-6 rounded-full border-2 border-primary/30 animate-spin-slow" />
              <div className="absolute -inset-12 rounded-full border border-primary/20 animate-reverse-spin" />
              <div className="absolute -inset-20 rounded-full border border-primary/10 animate-spin-slower" />
              
              {/* Orbiting particles */}
              <div className="absolute -inset-16 animate-spin-slow">
                <div className="absolute top-0 left-1/2 w-3 h-3 rounded-full bg-primary animate-pulse-glow" />
                <div className="absolute bottom-0 left-1/2 w-2 h-2 rounded-full bg-primary/70 animate-pulse-glow" />
              </div>
              <div className="absolute -inset-24 animate-reverse-spin">
                <div className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-primary/50 animate-pulse-glow" />
                <div className="absolute top-1/2 right-0 w-2 h-2 rounded-full bg-primary/50 animate-pulse-glow" />
              </div>
              
              {/* Logo */}
              <div className="relative">
                <img src={logo} alt="Aura VTC Logo" className="w-64 h-64 md:w-80 md:h-80 rounded-full object-cover glow-border-strong animate-float" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-transparent animate-pulse-glow" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground animate-fade-in" style={{
        animationDelay: '1s'
      }}>
          
          
        </div>
      </div>
    </section>;
};
export default HeroSection;