import { useRef, useLayoutEffect, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SplitSectionProps {
  id?: string;
  backgroundImage: string;
  headline: string;
  headlineHighlight?: string;
  subheadline: string;
  zIndex: number;
  children: ReactNode;
  scrollEnd?: string;
}

export default function SplitSection({
  id,
  backgroundImage,
  headline,
  headlineHighlight,
  subheadline,
  zIndex,
  children,
  scrollEnd = '+=125%',
}: SplitSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const headline = headlineRef.current;
    const card = cardRef.current;

    if (!section || !headline || !card) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: scrollEnd,
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

    }, section);

    return () => ctx.revert();
  }, [scrollEnd]);

  return (
    <section 
      ref={sectionRef} 
      id={id}
      className="section-pinned"
      style={{ zIndex }}
    >
      {/* Background Image */}
      <img 
        src={backgroundImage} 
        alt=""
        className="section-background"
      />
      
      {/* Overlay */}
      <div className="section-overlay" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center px-[7vw]">
        {/* Left Headline */}
        <div ref={headlineRef} className="w-[42vw] max-w-[500px]">
          <h2 className="font-heading font-extrabold text-[clamp(36px,5vw,72px)] text-[#1A2D3D] leading-[0.95] tracking-[0.02em] uppercase">
            {headlineHighlight ? (
              <>
                {headline}{' '}
                <span className="accent-underline">{headlineHighlight}</span>
              </>
            ) : (
              headline.split(' ').map((word, i) => (
                <span key={i} className={i === headline.split(' ').length - 1 ? 'accent-underline' : ''}>
                  {word}{' '}
                </span>
              ))
            )}
          </h2>
          <p className="mt-4 text-[clamp(14px,1.1vw,18px)] text-[#1A2D3D] leading-relaxed">
            {subheadline}
          </p>
        </div>

        {/* Right Card */}
        <div 
          ref={cardRef}
          className="absolute right-[7vw] top-[22vh] w-[38vw] max-w-[450px] min-h-[52vh]"
        >
          <div className="info-card h-full p-8">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
