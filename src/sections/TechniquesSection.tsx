import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Hand, Dumbbell, User, Brain } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const techniques = [
  { icon: Hand, text: 'Manual therapy & joint mobilization' },
  { icon: Dumbbell, text: 'Therapeutic exercise & stretching' },
  { icon: User, text: 'Movement retraining & posture work' },
  { icon: Brain, text: 'Pain science education & load management' },
];

export default function TechniquesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const headline = headlineRef.current;
    const card = cardRef.current;
    const itemElements = itemsRef.current.filter(Boolean);

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
        { x: '55vw', opacity: 0, rotate: -1 },
        { x: 0, opacity: 1, rotate: 0, ease: 'power2.out' },
        0.1
      );

      // List items stagger
      itemElements.forEach((item, i) => {
        scrollTl.fromTo(item,
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, ease: 'power2.out' },
          0.15 + i * 0.04
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
      className="section-pinned z-50"
    >
      {/* Background Image */}
      <img 
        src="/techniques_bg.jpg" 
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
            <span className="accent-underline">TECHNIQUES</span>
          </h2>
          <p className="mt-4 text-[clamp(14px,1.1vw,18px)] text-[#1A2D3D] leading-relaxed">
            Evidence-based methods tailored to your body and your goals.
          </p>
        </div>

        {/* Right Card */}
        <div 
          ref={cardRef}
          className="absolute right-[7vw] top-[24vh] w-[36vw] max-w-[420px]"
        >
          <div className="info-card p-8">
            <ol className="space-y-5">
              {techniques.map((tech, index) => (
                <li 
                  key={index}
                  ref={el => { itemsRef.current[index] = el; }}
                  className="flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-[#EAF4FA] flex items-center justify-center flex-shrink-0">
                    <tech.icon className="w-5 h-5 text-[#2F9BFF]" />
                  </div>
                  <span className="text-[#1A2D3D] font-medium">{tech.text}</span>
                </li>
              ))}
            </ol>

            <button className="mt-6 text-[#2F9BFF] font-semibold text-sm flex items-center gap-2 hover:underline">
              See a typical session
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
