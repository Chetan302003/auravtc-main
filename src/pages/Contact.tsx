import { useState } from 'react';
import { Mail, MessageCircle, Send, Clock } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const contactInfo = [
  {
    icon: MessageCircle,
    title: 'Discord',
    value: 'https://discord.gg/f4tmSvcABx',
    description: 'Join our Discord server for instant support',
    isLink: true,
  },
  {
    icon: Mail,
    title: 'Email',
    value: 'auratmp7@gmail.com',
    description: 'Send us an email for business inquiries',
    isLink: false,
  },
  {
    icon: Clock,
    title: 'Response Time',
    value: '24-48 Hours',
    description: 'We typically respond within 24-48 hours',
    isLink: false,
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: 'Message Sent!',
      description: "We'll get back to you as soon as possible.",
    });

    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <PageTransition>
      <Layout>
        <section className="py-24 min-h-screen">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-16 space-y-4 animate-slide-up">
              <span className="px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary font-display text-sm tracking-widest inline-block">
                GET IN TOUCH
              </span>
              <h1 className="font-display text-5xl md:text-6xl font-bold">
                <span className="text-foreground">Contact </span>
                <span className="text-primary glow-text">Us</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Have questions? We'd love to hear from you
              </p>
              <div className="neon-line max-w-xs mx-auto" />
            </div>

            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-stretch">
              {/* Left Column: Contact Info */}
              <div className="flex flex-col animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="font-display text-2xl font-bold mb-6">Ways to Reach Us</h2>
                
                <div className="flex-grow flex flex-col gap-6">
                  {contactInfo.map((info) => {
                    const Icon = info.icon;
                    const CardWrapper = info.isLink ? 'a' : 'div';

                    return (
                      <CardWrapper
                        key={info.title}
                        href={info.isLink ? info.value : undefined}
                        target={info.isLink ? "_blank" : undefined}
                        rel={info.isLink ? "noreferrer" : undefined}
                        className={`glass-card rounded-2xl p-6 transition-all duration-300 group flex flex-col justify-center flex-1 border border-white/5 
                          ${info.isLink 
                            ? 'cursor-pointer hover:border-primary/50 hover:scale-[1.02] active:scale-[0.98]' 
                            : 'hover:border-primary/50'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-display font-semibold text-foreground">
                                {info.title}
                              </h3>
                              {info.isLink && (
                                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase font-bold animate-pulse">
                                  Live
                                </span>
                              )}
                            </div>
                            
                            {info.isLink ? (
                              <p className="text-sm text-muted-foreground">{info.description}</p>
                            ) : (
                              <>
                                <p className="text-primary font-medium text-sm">{info.value}</p>
                                <p className="text-xs text-muted-foreground">{info.description}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </CardWrapper>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Contact Form */}
              <div className="animate-slide-up flex flex-col" style={{ animationDelay: '0.2s' }}>
                <h2 className="font-display text-2xl font-bold mb-6">Send a Message</h2>
                <form 
                  onSubmit={handleSubmit} 
                  className="glass-card rounded-2xl p-8 space-y-6 hover:border-primary/50 transition-all duration-300 group flex-grow flex flex-col"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Name</label>
                      <Input
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="bg-secondary/50 border-border focus:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Email</label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="bg-secondary/50 border-border focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Subject</label>
                    <Input
                      placeholder="What's this about?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="bg-secondary/50 border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2 flex-grow flex flex-col">
                    <label className="text-sm font-medium text-foreground">Message</label>
                    <Textarea
                      placeholder="Tell us more about your inquiry..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      className="bg-secondary/50 border-border focus:border-primary resize-none flex-grow"
                      rows={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full mt-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        Send Message
                        <Send className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </PageTransition>
  );
};

export default Contact;