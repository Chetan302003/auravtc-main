import { useState } from 'react';
import { Mail, MessageCircle, Send, Clock, ChevronDown } from 'lucide-react';
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
    discordId: '',
    department: 'Management',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
const roleMap: Record<string, string> = {
    "HR TEAM": "1431313604216356976", 
    "Event Team": "1431313604384395446",
    "Management": "1431313594083053669"
  };

  const selectedRoleId = roleMap[formData.department] || roleMap["Management"];
    try {
      // 1. REPLACE THIS URL with your actual Discord Webhook URL
     const DISCORD_WEBHOOK_URL = import.meta.env.VITE_DISCORD_WEBHOOK_URL;

      // 2. Create the Discord Embed Payload
      const payload = {
        username: "Aura VTC Contact Bot",
        content: `New message for <@&${selectedRoleId}>`,
        embeds: [
          {
            title: `📩 New Message: ${formData.subject}`,
            color: 3066993, 
            fields: [
              { name: "👤 Name", value: formData.name, inline: true },
              { name: "📧 Email", value: formData.email, inline: true },
              { name: "🎮 Discord ID", value: formData.discordId || "Not provided", inline: false },
              { name: "🏢 Department", value: formData.department, inline: true },
              { name: "🏷️ Subject", value: formData.subject,  inline: true },
              { name: "📝 Message", value: formData.message },
            ],
            timestamp: new Date().toISOString(),
            footer: { text: "Sent from Aura VTC Website" }
          }
        ]
      };

      // 3. Send the request
      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to send to Discord');

      toast({
        title: 'Message Sent!',
        description: "Your inquiry has been sent directly to our team on Discord.",
      });

      // 4. Reset form (Including discordId)
      setFormData({ name: '', email: '', discordId: '', department: '', subject: '', message: '' });

    } catch (error) {
      toast({
        title: 'Error',
        description: "Something went wrong. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-foreground">Discord ID </label>
                          <Input
                             type="text"
                               placeholder="username#1234"
                               value={formData.discordId}
                               onChange={(e) => setFormData({ ...formData, discordId: e.target.value })}
                               required
                               className="bg-secondary/50 border-border focus:border-primary"
                          />
                    </div>
                  <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground"> Department </label>
                    <div className="relative group">
                      <select 
                           value={formData.department}
                           onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                           className="flex h-10 w-full rounded-full border border-primary/40 bg-secondary/10 backdrop-blur-lg px-6 py-2 text-sm text-foreground transition-all duration-300 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none hover:border-primary hover:shadow-[0_0_15px_rgba(46,204,113,0.2)]"
                      >
                               <option value="HR TEAM" className="bg-[#1A1F2C] text-foreground">HR Team</option>
                               <option value="Event Team" className="bg-[#1A1F2C] text-foreground">Event Team</option>
                               <option value="Management" className="bg-[#1A1F2C] text-foreground">Management</option>
                      </select>                   
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary pointer-events-none transition-colors" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 h-10 flex-grow flex flex-col">
                    <label className="text-sm font-medium text-foreground">Subject</label>
                    <Input
                      placeholder="What's this about?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="bg-secondary/50 border-border h-10 transition-all duration-200 focus:border-primary focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 outline-none"
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
