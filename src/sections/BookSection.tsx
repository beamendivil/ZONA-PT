import { useRef, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Phone, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

gsap.registerPlugin(ScrollTrigger);

export default function BookSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'appointment' | 'call'>('appointment');

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
          end: '+=140%',
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

  const openDialog = (type: 'appointment' | 'call') => {
    setDialogType(type);
    setDialogOpen(true);
  };

  return (
    <section 
      ref={sectionRef}
      id="book"
      className="section-pinned z-[90]"
    >
      {/* Background Image */}
      <img 
        src="/book_bg.jpg" 
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
            BOOK A <span className="accent-underline">SESSION</span>
          </h2>
          <p className="mt-4 text-[clamp(14px,1.1vw,18px)] text-[#1A2D3D] leading-relaxed">
            Same-week appointments. In-network with most plans.
          </p>
        </div>

        {/* Right Card */}
        <div 
          ref={cardRef}
          className="absolute right-[7vw] top-[22vh] w-[38vw] max-w-[450px]"
        >
          <div className="info-card p-8">
            <div className="space-y-4">
              <button 
                onClick={() => openDialog('appointment')}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                Request an appointment
                <ArrowRight size={18} />
              </button>
              
              <button 
                onClick={() => openDialog('call')}
                className="w-full btn-outline flex items-center justify-center gap-2"
              >
                <Phone size={18} />
                Call the clinic
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-[#EAF4FA]">
              <p className="text-sm text-[#6B7C8D] flex items-center gap-2">
                <Check size={16} className="text-[#2F9BFF]" />
                No referral needed for most cases.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {dialogType === 'appointment' ? 'Request an Appointment' : 'Call the Clinic'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-6">
            {dialogType === 'appointment' ? (
              <div className="space-y-4">
                <p className="text-[#6B7C8D]">
                  Fill out the form below and we'll get back to you within 24 hours to confirm your appointment.
                </p>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl border border-[#EAF4FA] focus:border-[#2F9BFF] focus:outline-none"
                  />
                  <input 
                    type="tel" 
                    placeholder="Phone number"
                    className="w-full px-4 py-3 rounded-xl border border-[#EAF4FA] focus:border-[#2F9BFF] focus:outline-none"
                  />
                  <input 
                    type="email" 
                    placeholder="Email address"
                    className="w-full px-4 py-3 rounded-xl border border-[#EAF4FA] focus:border-[#2F9BFF] focus:outline-none"
                  />
                  <button className="w-full btn-primary">
                    Submit Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-[#6B7C8D]">
                  Call us directly to book your appointment or ask questions.
                </p>
                <div className="py-4">
                  <a 
                    href="tel:+15551234567"
                    className="text-2xl font-heading font-bold text-[#2F9BFF] hover:underline"
                  >
                    (555) 123-4567
                  </a>
                </div>
                <p className="text-sm text-[#6B7C8D]">
                  Available Monday–Friday, 8am–6pm
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
