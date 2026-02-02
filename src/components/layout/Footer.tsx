import { Link } from 'react-router-dom';
import { Truck, Github, Twitter, MessageCircle, Heart } from 'lucide-react';
import logo from '@/assets/logo.png';

const Footer = () => {
  return (
    <footer className="relative bg-card border-t border-border/50">
      {/* Glow effect at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Aura VTC" className="h-12 w-12 rounded-full" />
              <span className="font-display font-bold text-xl">
                <span className="text-foreground">AURA</span>
                <span className="text-primary"> VTC</span>
              </span>
            </Link>
            <p className="text-muted-foreground max-w-md mb-4">
              Experience the thrill of virtual trucking with Aura VTC. Join our community of professional drivers on TruckersMP and embark on an extraordinary journey across Europe and beyond.
            </p>
            <div className="flex gap-4">
              <a
                href="https://truckersmp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-secondary rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-300"
              >
                <Truck className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-secondary rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-secondary rounded-lg hover:bg-primary/10 hover:text-primary transition-all duration-300"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'Team', 'Events', 'Apply'].map((link) => (
                <li key={link}>
                  <Link
                    
                     to={link === 'Home' ? '/' : `/${link.toLowerCase()}`}
                  
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
  <h4 className="font-display font-semibold text-foreground mb-4">Resources</h4>
  <ul className="space-y-2">
    {['Server Status', 'Contact', 'TruckersMP'].map((link) => (
      <li key={link}>
        {link === 'TruckersMP' ? (
          <a
            href="https://truckersmp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors duration-300"
          >
            {link}
          </a>
        ) : (
          <Link
            /* FIX: Convert 'Server Status' to 'server-status' and 'Contact' to 'contact' */
            to={`/${link.toLowerCase().replace(' ', '-')}`}
            className="text-muted-foreground hover:text-primary transition-colors duration-300"
          >
            {link}
          </Link>
        )}
      </li>
    ))}
  </ul>
</div>
          {/* <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2">
              {['Server Status', 'Contact', 'TruckersMP'].map((link) => (
                <li key={link}>
                  <a
                    href={link === 'TruckersMP' ? 'https://truckersmp.com' : `/${link.toLowerCase().replace(' ', '-')}`}
                    target={link === 'TruckersMP' ? '_blank' : undefined}
                    rel={link === 'TruckersMP' ? 'noopener noreferrer' : undefined}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>*/}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Aura VTC. All rights reserved.
          </p>
<p className="text-muted-foreground text-sm flex items-center gap-1">
  Built by 
  <a 
    href="https://truckersmp.com/user/5936847" // Replace with your actual link
    target="_blank" 
    rel="noopener noreferrer"
    className="text-primary font-semibold hover:underline"
  >
    Chetan
  </a> 
  <Heart className="w-4 h-4 text-primary fill-primary" />
</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
