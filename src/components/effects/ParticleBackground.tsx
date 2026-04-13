import { useEffect, useRef } from 'react';

const ParticleBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 20}s`;
      particle.style.animationDuration = `${15 + Math.random() * 20}s`;

      const tx = (Math.random() - 0.5) * 60; // Random x movement (-30vw to 30vw)
      const ty = (Math.random() - 0.5) * 60; // Random y movement (-30vh to 30vh)
      particle.style.setProperty('--tx', `${tx}vw`);
      particle.style.setProperty('--ty', `${ty}vh`);

      container.appendChild(particle);
    }

    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-30 pointer-events-none" />
      <div ref={containerRef} className="particles fixed inset-0" />
    </>
  );
};

export default ParticleBackground;
