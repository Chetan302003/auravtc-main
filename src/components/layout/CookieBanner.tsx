import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Cookie, X } from 'lucide-react';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (level: string) => {
    localStorage.setItem('cookie-consent', level);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-4 right-4 z-[100] max-w-[340px] w-[calc(100%-2rem)] pointer-events-none"
        >
          <div className="bg-card/95 backdrop-blur-md border border-border/50 shadow-2xl rounded-xl p-5 pointer-events-auto relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent" />
            
            <button 
              onClick={() => handleConsent('necessary_only')}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 mb-1 mt-1">
              <Cookie className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">We value your privacy</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  We use cookies to enhance your experience. 
                  <Link to="/privacy-policy" className="text-primary hover:underline ml-1">Learn more</Link>
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <Button 
                onClick={() => handleConsent('accept_all')}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm h-9"
              >
                Accept All
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => handleConsent('reject_all')}
                  variant="outline"
                  className="w-full text-xs h-8 border-border/50"
                >
                  Reject All
                </Button>
                <Button 
                  onClick={() => handleConsent('necessary_only')}
                  variant="ghost" 
                  className="w-full text-xs h-8 text-muted-foreground hover:text-foreground bg-secondary/30 hover:bg-secondary"
                >
                  Necessary Only
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
