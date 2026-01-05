import { Crown, Shield, Star, Users, Loader2, Heart, GraduationCap } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import PageTransition from '@/components/layout/PageTransition';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TruckersMPMember {
  id: number;
  user_id: number;
  username: string;
  steam_id: string;
  role_id: number;
  role: string;
  joinDate: string;
  is_owner: boolean;
  avatar: string | null;
}

type RoleTier = 'founder' | 'management' | 'hr' | 'events' | 'media' | 'member' | 'trainee';

const getRoleIcon = (role: string, isOwner: boolean) => {
  if (isOwner) return Crown;
  const normalizedRole = role.toLowerCase();
  
  // High priority department icons
  if (normalizedRole.includes('hr') || normalizedRole.includes('human')) return Heart;
  if (normalizedRole.includes('event')) return Star; // Using Star for Events
  if (normalizedRole.includes('media')) return Users; // Using Users for Media
  
  if (normalizedRole.includes('ceo') || normalizedRole.includes('owner') || normalizedRole.includes('founder')) return Crown;
  if (normalizedRole.includes('manager') || normalizedRole.includes('management') || normalizedRole.includes('admin') || normalizedRole.includes('director')) return Shield;
  if (normalizedRole.includes('trainee') || normalizedRole.includes('trial')) return GraduationCap;
  return Users;
};

const getRoleTier = (role: string, isOwner: boolean): RoleTier => {
  if (isOwner) return 'founder';
  const normalizedRole = role.toLowerCase();

  // 1. Check for specific departments FIRST (This is like the HR logic)
  if (normalizedRole.includes('hr') || normalizedRole.includes('human')) return 'hr';
  if (normalizedRole.includes('event')) return 'events';
  if (normalizedRole.includes('media')) return 'media';

  // 2. Check for general Management second
  if (normalizedRole.includes('ceo') || normalizedRole.includes('owner') || normalizedRole.includes('founder')) return 'founder';
  if (normalizedRole.includes('manager') || normalizedRole.includes('management') || normalizedRole.includes('admin') || normalizedRole.includes('director')) return 'management';
  
  // 3. Trainees
  if (normalizedRole.includes('trainee') || normalizedRole.includes('trial')) return 'trainee';
  
  return 'member';
};

const tierStyles: Record<RoleTier, string> = {
  founder: 'border-yellow-500/50 bg-yellow-500/5',
  management: 'border-blue-500/50 bg-blue-500/5',
  hr: 'border-pink-500/50 bg-pink-500/5',
  events: 'border-orange-500/50 bg-orange-500/5',
  media: 'border-purple-500/50 bg-purple-500/5',
  member: 'border-primary/50 bg-primary/5',
  trainee: 'border-muted/50 bg-muted/5',
};

const tierGlow: Record<RoleTier, string> = {
  founder: 'shadow-yellow-500/20',
  management: 'shadow-blue-500/20',
  hr: 'shadow-pink-500/20',
  events: 'shadow-orange-500/20',
  media: 'shadow-purple-500/20',
  member: 'shadow-primary/20',
  trainee: 'shadow-muted/20',
};

const tierLabels: Record<RoleTier, string> = {
  founder: 'Founder',
  management: 'Management',
  hr: 'Human Resources',
  events: 'Event Team', 
  media: 'Media Team',
  member: 'Members',
  trainee: 'Trainees',
};

const Team = () => {
  const [members, setMembers] = useState<TruckersMPMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('truckersmp-members');
        
        if (error) throw error;
        
        // Sort members: owners first, then by role
        const sortedMembers = (data.members || []).sort((a: TruckersMPMember, b: TruckersMPMember) => {
          if (a.is_owner && !b.is_owner) return -1;
          if (!a.is_owner && b.is_owner) return 1;
          return a.role_id - b.role_id;
        });
        
        setMembers(sortedMembers);
      } catch (err) {
        console.error('Error fetching members:', err);
        setError('Failed to load team members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  return (
    <PageTransition>
    <Layout>
      <section className="py-16 sm:py-20 md:py-24 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-16 space-y-3 sm:space-y-4 animate-slide-up">
            <span className="px-3 sm:px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary font-display text-xs sm:text-sm tracking-widest inline-block">
              MEET THE TEAM
            </span>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold">
              <span className="text-foreground">Our </span>
              <span className="text-primary glow-text">Team</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              The dedicated individuals who make Aura VTC the best it can be
            </p>
            <div className="neon-line max-w-xs mx-auto" />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-16 sm:py-20">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-spin" />
              <span className="ml-3 text-sm sm:text-base text-muted-foreground">Loading team members...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
             <div className="text-center py-16 sm:py-20">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-destructive mx-auto mb-4" />
              <h3 className="font-display text-xl sm:text-2xl font-bold mb-2">Error Loading Team</h3>
              <p className="text-sm sm:text-base text-muted-foreground">{error}</p>
            </div>
          )}

          {/* Team Grid - Grouped by Role */}
          {!loading && !error && members.length > 0 && (
            <>
              {(['founder', 'management', 'hr', 'events', 'media', 'member', 'trainee'] as RoleTier[]).map((tierKey) => {
                const tierMembers = members.filter(
                  (m) => getRoleTier(m.role, m.is_owner) === tierKey
                );
                
                // Skip empty sections
                if (tierMembers.length === 0) return null;

                return (
                  <div key={tierKey} className="mb-8 sm:mb-12 animate-slide-up" style={{ animationDelay: `${0.1 * (['founder', 'management', 'hr', 'member', 'trainee'] as RoleTier[]).indexOf(tierKey)}s` }}>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">
                      <span className="text-primary animate-pulse-glow">{tierLabels[tierKey]}</span>
                    </h2>
                    <div className={`grid gap-4 sm:gap-6 ${
                      tierMembers.length === 1 
                        ? 'grid-cols-1 max-w-xs mx-auto' 
                        : tierMembers.length === 2 
                          ? 'grid-cols-2 max-w-lg mx-auto'
                          : tierMembers.length === 3
                            ? 'grid-cols-3 max-w-2xl mx-auto'
                            : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                    }`}>
                      {tierMembers.map((member, index) => {
                        const tier = getRoleTier(member.role, member.is_owner);
                        const Icon = getRoleIcon(member.role, member.is_owner);
                        
                        return (
                          <a
                            key={member.id}
                            href={`https://truckersmp.com/user/${member.user_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`glass-card rounded-2xl p-6 text-center group hover:scale-105 hover:-translate-y-2 transition-all duration-500 ${tierStyles[tier]} hover:shadow-lg ${tierGlow[tier]} animate-scale-in`}
                            style={{ animationDelay: `${index * 0.08}s` }}
                          >
                            <div className="relative inline-block mb-4">
                              {member.avatar ? (
                                <img 
                                  src={member.avatar} 
                                  alt={member.username}
                                  className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-primary/30 group-hover:border-primary group-hover:glow-border transition-all duration-300"
                                />
                              ) : (
                                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                                  <Icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                                </div>
                              )}
                              {member.is_owner && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce-subtle">
                                  <Crown className="w-3 h-3 text-yellow-900" />
                                </div>
                              )}
                            </div>
                            <h3 className="w-full font-display text-sm sm:text-lg font-bold text-foreground mb-1 truncate group-hover:text-primary transition-colors">
                              {member.username}
                            </h3>
                            <p className="w-full text-primary font-medium text-[10px] sm:text-sm mb-2 truncate">
                              {member.role}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Joined {new Date(member.joinDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </p>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* No Members Fallback */}
          {!loading && !error && members.length === 0 && (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-2xl font-bold mb-2">No Team Members Found</h3>
              <p className="text-muted-foreground">Unable to load team data at this time.</p>
            </div>
          )}

          {/* Join Team CTA */}
          <div className="mt-20 text-center glass-card rounded-3xl p-12 max-w-2xl mx-auto animate-slide-up hover:glow-border transition-all duration-500" style={{ animationDelay: '0.5s' }}>
            <h2 className="font-display text-3xl font-bold mb-4">
              <span className="text-foreground">Want to Join </span>
              <span className="text-primary animate-pulse-glow">Our Team?</span>
            </h2>
            <p className="text-muted-foreground mb-6">
              We're always looking for dedicated individuals to help grow our community
            </p>
            <a
              href="/apply"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-display font-bold rounded-lg hover:scale-110 hover:shadow-[0_0_30px_hsl(120_100%_50%_/_0.5)] transition-all duration-300"
            >
              Apply Now
            </a>
          </div>
        </div>
      </section>
    </Layout>
    </PageTransition>
  );
};

export default Team;
