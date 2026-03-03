import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ClipboardCheck, Hand, Home } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const cards = [
  {
    icon: ClipboardCheck,
    title: '1. Assessment',
    description: 'We listen, test, and map out your goals before any treatment begins.',
  },
  {
    icon: Hand,
    title: '2. Treatment',
    description: 'Hands-on therapy, targeted exercises, and progress checks at every step.',
  },
  {
    icon: Home,
    title: '3. Maintenance',
    description: 'A simple routine you can keep at home to stay strong and avoid setbacks.',
  },
];

export default function WhatToExpectSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const headline = headlineRef.current;
    const cardElements = cardsRef.current.filter(Boolean);

    if (!section || !headline || cardElements.length === 0) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        }
      });

      // Headline entrance (0-30%)
      scrollTl.fromTo(headline,
        { x: '-50vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'power2.out' },
        0
      );

      // Cards entrance (staggered 5-30%)
      cardElements.forEach((card, i) => {
        scrollTl.fromTo(card,
          { y: '40vh', opacity: 0, rotate: -2 },
          { y: 0, opacity: 1, rotate: 0, ease: 'power2.out' },
          0.05 + i * 0.05
        );
      });

      // SETTLE (30-70%): Static

      // EXIT (70-100%)
      scrollTl.fromTo(headline,
        { x: 0, opacity: 1 },
        { x: '-30vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      cardElements.forEach((card, i) => {
        scrollTl.fromTo(card,
          { y: 0, opacity: 1 },
          { y: '-25vh', opacity: 0, ease: 'power2.in' },
          0.7 + i * 0.03
        );
      });

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      id="what-to-expect"
      className="section-pinned z-20"
    >
      {/* Background Image */}
      <img 
        src="/what_to_expect_bg.jpg" 
        alt="Physical therapy treatment"
        className="section-background"
      />
      
      {/* Overlay */}
      <div className="section-overlay" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center px-[7vw]">
        {/* Headline */}
        <div ref={headlineRef} className="mb-8">
          <h2 className="font-heading font-extrabold text-[clamp(36px,5vw,72px)] text-[#1A2D3D] leading-[0.95] tracking-[0.02em] uppercase">
            WHAT TO <span className="accent-underline">EXPECT</span>
          </h2>
          <p className="mt-4 text-[clamp(14px,1.1vw,18px)] text-[#1A2D3D] max-w-[500px]">
            A clear plan from day one—no guesswork, no overwhelm.
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-wrap gap-6 mt-auto mb-[8vh]">
          {cards.map((card, index) => (
            <div
              key={card.title}
              ref={el => { cardsRef.current[index] = el; }}
              className="info-card w-[26vw] min-w-[280px] h-[30vh] min-h-[220px] p-6 flex flex-col border-t-[3px] border-[#2F9BFF]"
            >
              <card.icon className="w-8 h-8 text-[#2F9BFF] mb-4" strokeWidth={2} />
              <h3 className="font-heading font-bold text-xl text-[#1A2D3D] mb-2">
                {card.title}
              </h3>
              <p className="text-[#6B7C8D] text-sm leading-relaxed">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
