import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Truck, Shield, Loader2, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import ParticleBackground from '@/components/effects/ParticleBackground';
import ForgotPasswordDialog from '@/components/auth/ForgotPasswordDialog';

// Discord icon component
const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

// Google icon component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
    </svg>
);

const Auth = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'discord' | 'google' | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { user, signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/admin');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(loginEmail, loginPassword);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Welcome back!');
        navigate('/admin');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);

    try {
      const { error } = await signUp(signupEmail, signupPassword, signupName.trim());
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created successfully! You can now log in.');
        setActiveTab('login');
        setLoginEmail(signupEmail);
        setSignupName('');
        setSignupEmail('');
        setSignupPassword('');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'discord' | 'google') => {
    setOauthLoading(provider);
    try {
      const redirectUrl = `${window.location.origin}/admin`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: redirectUrl,
                    queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        toast.error(`Failed to sign in with ${provider}: ${error.message}`);
      }
    } catch (err) {
      toast.error(`Failed to sign in with ${provider}`);
    } finally {
      setOauthLoading(null);
    }
  };

  const OAuthButtons = () => (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuthSignIn('discord')}
          disabled={oauthLoading !== null || isLoading}
          className="bg-[#5865F2]/10 border-[#5865F2]/30 hover:bg-[#5865F2]/20 hover:border-[#5865F2]/50 text-foreground"
        >
          {oauthLoading === 'discord' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <DiscordIcon className="w-4 h-4 mr-2" />
              Discord
            </>
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuthSignIn('google')}
          disabled={oauthLoading !== null || isLoading}
          className="bg-[#1b2838]/30 border-[#66c0f4]/30 hover:bg-[#1b2838]/50 hover:border-[#66c0f4]/50 text-foreground"
        >
          {oauthLoading === 'google' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <GoogleIcon className="w-4 h-4 mr-2" />
              Google
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
        <ParticleBackground />
        
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="glass-card rounded-2xl p-8 border border-primary/20 hover:border-primary/40 transition-all duration-500">
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/30 mb-4"
              >
                <Shield className="w-8 h-8 text-primary" />
              </motion.div>
              <h1 className="text-2xl font-display font-bold text-foreground glow-text mb-2">
                {activeTab === 'login' ? 'Admin Login' : 'Create Account'}
              </h1>
              <p className="text-muted-foreground text-sm">
                {activeTab === 'login' ? 'Access your VTC dashboard' : 'Sign up for a new account'}
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <Label htmlFor="login-email" className="text-foreground font-medium">
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="admin@auravtc.com"
                      required
                      className="mt-1.5 bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="login-password" className="text-foreground font-medium">
                      Password
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="login-password"
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold py-6 glow-border transition-all duration-300 hover:glow-border-strong"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-5 h-5 mr-2" />
                        Login
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="mt-6">
                  <OAuthButtons />
                </div>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-5">
                  <div>
                    <Label htmlFor="signup-name" className="text-foreground font-medium">
                      Name
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="John Doe"
                      required
                      maxLength={100}
                      className="mt-1.5 bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-email" className="text-foreground font-medium">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="mt-1.5 bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="signup-password" className="text-foreground font-medium">
                      Password
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        required
                        minLength={6}
                        className="bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Password must be at least 6 characters
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold py-6 glow-border transition-all duration-300 hover:glow-border-strong"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5 mr-2" />
                        Sign Up
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="mt-6">
                  <OAuthButtons />
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t border-border/30 text-center">
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                <Truck className="w-4 h-4 text-primary" />
                <span>Aura VTC Admin Panel</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <ForgotPasswordDialog 
        open={showForgotPassword} 
        onOpenChange={setShowForgotPassword} 
      />
    </Layout>
  );
};

export default Auth;


// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Eye, EyeOff, LogIn, Truck, Shield, Loader2 } from 'lucide-react';
// import { useAuth } from '@/hooks/useAuth';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { toast } from 'sonner';
// import Layout from '@/components/layout/Layout';
// import ParticleBackground from '@/components/effects/ParticleBackground';

// const Auth = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const { user, signIn } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (user) {
//       navigate('/admin');
//     }
//   }, [user, navigate]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const { error } = await signIn(email, password);
//       if (error) {
//         if (error.message.includes('Invalid login credentials')) {
//           toast.error('Invalid email or password');
//         } else {
//           toast.error(error.message);
//         }
//       } else {
//         toast.success('Welcome back!');
//         navigate('/admin');
//       }
//     } catch (err) {
//       toast.error('An unexpected error occurred');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
//         <ParticleBackground />
        
//         {/* Background effects */}
//         <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background" />
//         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
//         <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />

//         <motion.div
//           initial={{ opacity: 0, y: 20, scale: 0.95 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           transition={{ duration: 0.6 }}
//           className="relative z-10 w-full max-w-md"
//         >
//           {/* Glass card */}
//           <div className="glass-card rounded-2xl p-8 border border-primary/20 hover:border-primary/40 transition-all duration-500">
//             {/* Header */}
//             <div className="text-center mb-8">
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
//                 className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/30 mb-4"
//               >
//                 <Shield className="w-8 h-8 text-primary" />
//               </motion.div>
//               <h1 className="text-2xl font-display font-bold text-foreground glow-text mb-2">
//                 Admin Login
//               </h1>
//               <p className="text-muted-foreground text-sm">
//                 Access your VTC dashboard
//               </p>
//             </div>

//             {/* Form */}
//             <form onSubmit={handleSubmit} className="space-y-5">
//               <div>
//                 <Label htmlFor="email" className="text-foreground font-medium">
//                   Email Address
//                 </Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="admin@auravtc.com"
//                   required
//                   className="mt-1.5 bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="password" className="text-foreground font-medium">
//                   Password
//                 </Label>
//                 <div className="relative mt-1.5">
//                   <Input
//                     id="password"
//                     type={showPassword ? 'text' : 'password'}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="••••••••"
//                     required
//                     minLength={6}
//                     className="bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20 text-foreground placeholder:text-muted-foreground pr-10"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
//                   >
//                     {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                   </button>
//                 </div>
//               </div>

//               <Button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold py-6 glow-border transition-all duration-300 hover:glow-border-strong"
//               >
//                 {isLoading ? (
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                 ) : (
//                   <>
//                     <LogIn className="w-5 h-5 mr-2" />
//                     Sign In
//                   </>
//                 )}
//               </Button>
//             </form>

//             {/* Footer */}
//             <div className="mt-6 pt-6 border-t border-border/30 text-center">
//               <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
//                 <Truck className="w-4 h-4 text-primary" />
//                 <span>Aura VTC Management System</span>
//               </div>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </Layout>
//   );
// };

// export default Auth;
