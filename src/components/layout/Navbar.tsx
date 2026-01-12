import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Users, Calendar, FileText, Server, Mail, Shield, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo.png';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/team', label: 'Our Team', icon: Users },
  { path: '/events', label: 'Events', icon: Calendar },
  { path: '/apply', label: 'Apply', icon: FileText },
  { path: '/gallery', label: 'Gallery', icon: Image },
  { path: '/server-status', label: 'Server Status', icon: Server },
  { path: '/contact', label: 'Contact', icon: Mail },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-primary/5'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src={logo}
                alt="Aura VTC"
                className="h-12 w-12 rounded-full transition-all duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="font-display font-bold text-xl tracking-wider">
              <span className="text-foreground">AURA</span>
              <span className="text-primary glow-text"> VTC</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="nav"
                    className={`relative ${
                      isActive ? 'text-primary' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                    )}
                  </Button>
                </Link>
              );
            })}
          
      {/* Admin/Login Link */}
            {user ? (
              <Link to="/admin">
                <Button
                  variant="nav"
                  className={`relative ${
                    location.pathname === '/admin' ? 'text-primary' : ''
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                  {isAdmin && (
                    <span className="ml-1 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                  {location.pathname === '/admin' && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                  )}
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button
                  variant="nav"
                  className={`relative ${
                    location.pathname === '/auth' ? 'text-primary' : ''
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Login
                  {location.pathname === '/auth' && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                  )}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-b border-border/50 transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="container mx-auto px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'hover:bg-secondary text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

            {/* Admin/Login Link for Mobile */}
          {user ? (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                location.pathname === '/admin'
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'hover:bg-secondary text-foreground'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span className="font-medium">Admin</span>
              {isAdmin && (
                <span className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </Link>
          ) : (
            <Link
              to="/auth"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                location.pathname === '/auth'
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'hover:bg-secondary text-foreground'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span className="font-medium">Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};        

export default Navbar;
