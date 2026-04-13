import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import StatsSection from '@/components/home/StatsSection';
import CTASection from '@/components/home/CTASection';
import PartnersSection from '@/components/home/PartnersSection';

import PageTransition from '@/components/layout/PageTransition';
import ScrollReveal from '@/components/home/ScrollReveal';

const Index = () => {
  return (
    <PageTransition>
      <Layout>
        <div className="relative">
          <HeroSection />
        </div>
        <ScrollReveal>
          <AboutSection />
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <StatsSection />
        </ScrollReveal>
        <PartnersSection />
        <ScrollReveal delay={0.1}>
          <CTASection />
        </ScrollReveal>
      </Layout>
    </PageTransition>
  );
};

export default Index;
