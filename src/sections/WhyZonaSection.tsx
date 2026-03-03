import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Award, UserCheck, CreditCard, Clock } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  { icon: Award, text: 'Licensed physical therapists' },
  { icon: UserCheck, text: 'One-on-one sessions' },
  { icon: CreditCard, text: 'Insurance-friendly billing' },
  { icon: Clock, text: 'Flexible scheduling' },
];

export default function WhyZonaSection() {
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
        { x: '55vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'power2.out' },
        0.1
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
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="section-pinned z-[80]"
    >
      {/* Background Image */}
      <img 
        src="/why_zona_bg.jpg" 
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
            WHY <span className="accent-underline">ZONA PT</span>
          </h2>
          <p className="mt-4 text-[clamp(14px,1.1vw,18px)] text-[#1A2D3D] leading-relaxed">
            Experienced therapists, modern facilities, and a plan built around your real life.
          </p>
        </div>

        {/* Right Card */}
        <div 
          ref={cardRef}
          className="absolute right-[7vw] top-[24vh] w-[36vw] max-w-[420px]"
        >
          <div className="info-card p-8">
            <ul className="space-y-5">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#EAF4FA] flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-[#2F9BFF]" />
                  </div>
                  <span className="text-[#1A2D3D] font-medium">{feature.text}</span>
                </li>
              ))}
            </ul>

            <button className="mt-6 text-[#2F9BFF] font-semibold text-sm flex items-center gap-2 hover:underline">
              Meet the team
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
