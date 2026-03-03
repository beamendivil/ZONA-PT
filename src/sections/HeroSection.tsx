import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Phone } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLParagraphElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    const headline = headlineRef.current;
    const subhead = subheadRef.current;
    const cta = ctaRef.current;
    const trust = trustRef.current;
    const bg = bgRef.current;

    if (!section || !card || !headline || !subhead || !cta || !trust || !bg) return;

    const ctx = gsap.context(() => {
      // Initial load animation
      const loadTl = gsap.timeline();
      
      loadTl
        .fromTo(bg, 
          { opacity: 0, scale: 1.06 },
          { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' }
        )
        .fromTo(card,
          { x: '-12vw', opacity: 0, rotate: -1 },
          { x: 0, opacity: 1, rotate: 0, duration: 0.8, ease: 'power3.out' },
          0.15
        )
        .fromTo(headline.querySelectorAll('.word'),
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.03, ease: 'power2.out' },
          0.35
        )
        .fromTo([subhead, cta, trust],
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out' },
          0.55
        );

      // Scroll-driven exit animation
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
          onLeaveBack: () => {
            // Reset all elements when scrolling back to top
            gsap.set([card, headline, subhead, cta, trust], { opacity: 1, x: 0, rotate: 0 });
            gsap.set(bg, { scale: 1, y: 0 });
          }
        }
      });

      // ENTRANCE (0-30%): Hold visible (already animated on load)
      // SETTLE (30-70%): Static
      // EXIT (70-100%): Animate out
      scrollTl
        .fromTo(card,
          { x: 0, opacity: 1, rotate: 0 },
          { x: '-55vw', opacity: 0, rotate: -2, ease: 'power2.in' },
          0.7
        )
        .fromTo(bg,
          { scale: 1, y: 0 },
          { scale: 1.04, y: '-3vh', ease: 'power2.in' },
          0.7
        );

    }, section);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section ref={sectionRef} className="section-pinned z-10">
      {/* Background Image */}
      <img 
        ref={bgRef}
        src="/hero_bg.jpg" 
        alt="Physical therapy session"
        className="section-background"
      />
      
      {/* Overlay */}
      <div className="section-overlay" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        {/* Left Card */}
        <div 
          ref={cardRef}
          className="glass-card ml-[7vw] w-[46vw] max-w-[600px] p-[clamp(22px,2.6vw,40px)]"
        >
          {/* Headline */}
          <h1 
            ref={headlineRef}
            className="font-heading font-extrabold text-[clamp(32px,4vw,56px)] text-[#1A2D3D] leading-[0.95] tracking-[0.02em] uppercase mb-6"
          >
            <span className="word inline-block">MOVEMENT,</span>{' '}
            <span className="word inline-block accent-underline">MADE</span>{' '}
            <span className="word inline-block accent-underline">SIMPLE</span>
          </h1>

          {/* Subheadline */}
          <p 
            ref={subheadRef}
            className="text-[clamp(14px,1.1vw,18px)] text-[#1A2D3D] leading-relaxed mb-8 max-w-[90%]"
          >
            Hands-on physical therapy that fits your schedule—so you can recover without the runaround.
          </p>

          {/* CTAs */}
          <div ref={ctaRef} className="flex flex-wrap items-center gap-4">
            <button 
              onClick={() => scrollToSection('book')}
              className="btn-primary flex items-center gap-2"
            >
              Book a session
              <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => scrollToSection('what-to-expect')}
              className="text-[#2F9BFF] font-semibold hover:underline flex items-center gap-2"
            >
              See how it works
            </button>
          </div>
        </div>
      </div>

      {/* Trust Line */}
      <p 
        ref={trustRef}
        className="absolute left-[7vw] bottom-[6vh] text-sm text-[#6B7C8D] flex items-center gap-2"
      >
        <Phone size={14} />
        In-network with most major plans • Same-week appointments
      </p>
    </section>
  );
}
