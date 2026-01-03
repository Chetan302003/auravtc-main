import { useState } from 'react';
import { CheckCircle2, AlertCircle, FileText, User, Truck, MessageSquare } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageTransition from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const requirements = [
  'Must have a valid TruckersMP account',
  'Minimum age of 16 years',
  'Working microphone for Discord',
  'Professional attitude and respect for others',
  'Active participation in convoys (minimum 2 per month)',
];

const Apply = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    truckersMPId: '',
    discordId: '',
    age: '',
    experience: '',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // HR TEAM ROLE ID (Using the ID you provided previously)
    const HR_ROLE_ID = "1431313604216356976"; 

    try {
      const DISCORD_WEBHOOK_URL = import.meta.env.VITE_AURA_DISCORD_WEBHOOK;

      const payload = {
        username: "Aura VTC Recruitment Bot",
        content: `🚨 New VTC Application for <@&${HR_ROLE_ID}>`,
        embeds: [
          {
            title: `🚛 New Application: ${formData.name}`,
            color: 3066993, // Aura Green
            fields: [
              { name: "👤 Name", value: formData.name, inline: true },
              { name: "🆔 TruckersMP ID", value: formData.truckersMPId, inline: true },
              { name: "🎮 Discord ID", value: formData.discordId, inline: true },
              { name: "🎂 Age", value: formData.age, inline: true },
              { name: "🛠️ Experience", value: formData.experience, inline: false },
              { name: "💡 Motivation", value: formData.reason, inline: false },
            ],
            timestamp: new Date().toISOString(),
            footer: { text: "Aura VTC Recruitment System" }
          }
        ]
      };

      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to send application');

      toast({
        title: 'Application Submitted!',
        description: "We'll review your application and get back to you soon.",
      });

      setFormData({
        name: '',
        truckersMPId: '',
        discordId: '',
        age: '',
        experience: '',
        reason: '',
      });

    } catch (error) {
      toast({
        title: 'Error',
        description: "Something went wrong. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };;

  return (
    <PageTransition>
    <Layout>
      <section className="py-24 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16 space-y-4 animate-slide-up">
            <span className="px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary font-display text-sm tracking-widest inline-block">
              START YOUR JOURNEY
            </span>
            <h1 className="font-display text-5xl md:text-6xl font-bold">
              <span className="text-foreground">Join </span>
              <span className="text-primary glow-text">Aura VTC</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Fill out the application form below to become part of our family
            </p>
            <div className="flex justify-center">
              <a
                href="https://truckersmp.com/vtc/75200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">View Aura VTC on TruckersMP</Button>
              </a>
            </div>
            <div className="neon-line max-w-xs mx-auto" />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Requirements */}
            <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="glass-card rounded-2xl p-8">
                <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary" />
                  Requirements
                </h2>
                <ul className="space-y-4">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card rounded-2xl p-8 border-yellow-500/30 bg-yellow-500/5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0" />
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-2">Important Note</h3>
                    <p className="text-muted-foreground text-sm">
                      Applications are reviewed within 48-72 hours. Make sure your TruckersMP and Discord IDs are correct for us to contact you.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Form */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                      <User className="w-4 h-4 text-primary" />
                      Your Name
                    </label>
                    <Input
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-secondary border-border focus:border-primary"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                        <Truck className="w-4 h-4 text-primary" />
                        TruckersMP ID
                      </label>
                      <Input
                        placeholder="e.g., 1234567"
                        value={formData.truckersMPId}
                        onChange={(e) => setFormData({ ...formData, truckersMPId: e.target.value })}
                        required
                        className="bg-secondary border-border focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        Discord ID
                      </label>
                      <Input
                        placeholder="e.g., user#1234"
                        value={formData.discordId}
                        onChange={(e) => setFormData({ ...formData, discordId: e.target.value })}
                        required
                        className="bg-secondary border-border focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Age</label>
                    <Input
                      type="number"
                      placeholder="Your age"
                      min="16"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      required
                      className="bg-secondary border-border focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Trucking Experience
                    </label>
                    <Textarea
                      placeholder="Tell us about your experience with ETS2/ATS and TruckersMP..."
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      required
                      rows={3}
                      className="bg-secondary border-border focus:border-primary resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Why do you want to join Aura VTC?
                    </label>
                    <Textarea
                      placeholder="Share your motivation for joining our community..."
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      required
                      rows={3}
                      className="bg-secondary border-border focus:border-primary resize-none"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
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

export default Apply;
