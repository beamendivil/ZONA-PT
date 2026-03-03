import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const issues = [
  'Lower back pain',
  'Neck stiffness',
  'Shoulder strain',
  'Knee rehab',
  'Hip mobility',
  'Sports injuries',
  'Post-surgery',
  'Chronic tightness',
];

export default function CommonIssuesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const headline = headlineRef.current;
    const card = cardRef.current;
    const tagElements = tagsRef.current.filter(Boolean);

    if (!section || !headline || !card) return;

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

      // ENTRANCE (0-30%)
      scrollTl.fromTo(headline,
        { x: '-55vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'power2.out' },
        0
      );

      scrollTl.fromTo(card,
        { x: '55vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'power2.out' },
        0.1
      );

      // Tags stagger
      tagElements.forEach((tag, i) => {
        scrollTl.fromTo(tag,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, ease: 'power2.out' },
          0.15 + i * 0.015
        );
      });

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
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="services"
      className="section-pinned z-40"
    >
      {/* Background Image */}
      <img 
        src="/common_issues_bg.jpg" 
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
            COMMON <span className="accent-underline">ISSUES</span>
          </h2>
          <p className="mt-4 text-[clamp(14px,1.1vw,18px)] text-[#1A2D3D] leading-relaxed">
            Back pain, sports injuries, post-surgery rehab, and everyday stiffness.
          </p>
        </div>

        {/* Right Card */}
        <div 
          ref={cardRef}
          className="absolute right-[7vw] top-[24vh] w-[36vw] max-w-[420px]"
        >
          <div className="info-card p-8">
            <h3 className="font-heading font-bold text-lg text-[#1A2D3D] mb-6">
              We treat
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {issues.map((issue, index) => (
                <span 
                  key={index}
                  ref={el => { tagsRef.current[index] = el; }}
                  className="tag text-center"
                >
                  {issue}
                </span>
              ))}
            </div>

            <button className="text-[#2F9BFF] font-semibold text-sm flex items-center gap-2 hover:underline">
              Not sure? Let's talk.
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
