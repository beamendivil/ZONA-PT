import { useRef, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const left = leftRef.current;
    const right = rightRef.current;

    if (!section || !left || !right) return;

    const ctx = gsap.context(() => {
      // Flowing section - just reveal animations
      gsap.fromTo(left,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          }
        }
      );

      gsap.fromTo(right,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          }
        }
      );

    }, section);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 3000);
  };

  return (
    <section 
      ref={sectionRef}
      className="relative bg-[#F6FBFE] py-[8vh] px-[7vw] z-[100]"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left - Contact Info */}
          <div ref={leftRef}>
            <h2 className="font-heading font-extrabold text-[clamp(32px,4vw,48px)] text-[#1A2D3D] leading-[0.95] tracking-[0.02em] uppercase mb-8">
              CONTACT
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EAF4FA] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#2F9BFF]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1A2D3D]">Address</p>
                  <p className="text-[#6B7C8D]">123 Wellness Drive, Suite 200<br />Phoenix, AZ 85001</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EAF4FA] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-[#2F9BFF]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1A2D3D]">Phone</p>
                  <a href="tel:+15551234567" className="text-[#2F9BFF] hover:underline">
                    (555) 123-4567
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EAF4FA] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-[#2F9BFF]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1A2D3D]">Email</p>
                  <a href="mailto:hello@zonapt.com" className="text-[#2F9BFF] hover:underline">
                    hello@zonapt.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EAF4FA] flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-[#2F9BFF]" />
                </div>
                <div>
                  <p className="font-semibold text-[#1A2D3D]">Hours</p>
                  <p className="text-[#6B7C8D]">Monday–Friday: 8am–6pm<br />Saturday: 9am–2pm</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Contact Form */}
          <div ref={rightRef}>
            <h3 className="font-heading font-bold text-xl text-[#1A2D3D] mb-6">
              Send a message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl border border-[#EAF4FA] bg-white focus:border-[#2F9BFF] focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <input 
                  type="email" 
                  placeholder="Email address"
                  className="w-full px-4 py-3 rounded-xl border border-[#EAF4FA] bg-white focus:border-[#2F9BFF] focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <textarea 
                  placeholder="Your message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-[#EAF4FA] bg-white focus:border-[#2F9BFF] focus:outline-none transition-colors resize-none"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {formSubmitted ? (
                  <>Message sent!</>
                ) : (
                  <>
                    Send message
                    <Send size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[#EAF4FA]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[#6B7C8D]">
              © Zona PT. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <button className="text-sm text-[#6B7C8D] hover:text-[#2F9BFF] transition-colors">
                Privacy
              </button>
              <button className="text-sm text-[#6B7C8D] hover:text-[#2F9BFF] transition-colors">
                Accessibility
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
