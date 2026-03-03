import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shirt, Clock, Ruler, Dumbbell, MessageCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const items = [
  { icon: Shirt, text: 'Bring comfortable clothes' },
  { icon: Clock, text: 'Arrive 10 minutes early' },
  { icon: Ruler, text: 'We\'ll measure movement and strength' },
  { icon: Dumbbell, text: 'You\'ll leave with 2–3 home exercises' },
];

export default function FirstVisitSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const headline = headlineRef.current;
    const card = cardRef.current;
    const cta = ctaRef.current;

    if (!section || !headline || !card || !cta) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=125%',
          pin: true,
          scrub: 0.6,
        }
      });

      // ENTRANCE (0-30%)
      scrollTl.fromTo(headline,
        { x: '-55vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'power2.out' },
        0
      );

      scrollTl.fromTo(card,
        { x: '55vw', opacity: 0, rotate: 1 },
        { x: 0, opacity: 1, rotate: 0, ease: 'power2.out' },
        0.08
      );

      scrollTl.fromTo(cta,
        { y: '10vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'power2.out' },
        0.18
      );

      // SETTLE (30-70%): Static

      // EXIT (70-100%)
      scrollTl.fromTo(headline,
        { x: 0, opacity: 1 },
        { x: '-25vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(card,
        { x: 0, opacity: 1 },
        { x: '35vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(cta,
        { y: 0, opacity: 1 },
        { y: '8vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="section-pinned z-30"
    >
      {/* Background Image */}
      <img 
        src="/first_visit_bg.jpg" 
        alt=""
        className="section-background"
      />
      
      {/* Overlay */}
      <div className="section-overlay" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center px-[7vw]">
        {/* Left Headline */}
        <div ref={headlineRef} className="w-[40vw] max-w-[480px]">
          <h2 className="font-heading font-extrabold text-[clamp(36px,5vw,72px)] text-[#1A2D3D] leading-[0.95] tracking-[0.02em] uppercase">
            YOUR <span className="accent-underline">FIRST</span> VISIT
          </h2>
          <p className="mt-4 text-[clamp(14px,1.1vw,18px)] text-[#1A2D3D] leading-relaxed">
            We'll explain every step, answer your questions, and send you home with a plan.
          </p>
        </div>

        {/* Right Card */}
        <div 
          ref={cardRef}
          className="absolute right-[7vw] top-[22vh] w-[38vw] max-w-[450px]"
        >
          <div className="info-card p-8">
            <ul className="space-y-5">
              {items.map((item, index) => (
                <li key={index} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#EAF4FA] flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-[#2F9BFF]" />
                  </div>
                  <span className="text-[#1A2D3D] font-medium">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom CTA */}
        <div 
          ref={ctaRef}
          className="absolute left-[7vw] bottom-[8vh]"
        >
          <button className="text-[#2F9BFF] font-semibold flex items-center gap-2 hover:underline">
            <MessageCircle size={18} />
            Questions? Call or text us.
          </button>
        </div>
      </div>
    </section>
  );
}
