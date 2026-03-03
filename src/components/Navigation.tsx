import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileOpen(false);
    }
  };

  return (
    <nav className={`nav-fixed ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="font-heading font-bold text-xl text-[#1A2D3D]">
          Zona PT
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => scrollToSection('services')}
            className="text-[#1A2D3D] font-medium hover:text-[#2F9BFF] transition-colors"
          >
            Services
          </button>
          <button 
            onClick={() => scrollToSection('what-to-expect')}
            className="text-[#1A2D3D] font-medium hover:text-[#2F9BFF] transition-colors"
          >
            What to Expect
          </button>
          <button 
            onClick={() => scrollToSection('book')}
            className="text-[#1A2D3D] font-medium hover:text-[#2F9BFF] transition-colors"
          >
            Book
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-[#2F9BFF] font-medium hover:underline"
          >
            <User size={18} />
            Client Login
          </button>
          <button 
            onClick={() => scrollToSection('book')}
            className="btn-outline py-2 px-6 text-sm"
          >
            Book a session
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg p-6 flex flex-col gap-4">
          <button 
            onClick={() => scrollToSection('services')}
            className="text-[#1A2D3D] font-medium text-left py-2"
          >
            Services
          </button>
          <button 
            onClick={() => scrollToSection('what-to-expect')}
            className="text-[#1A2D3D] font-medium text-left py-2"
          >
            What to Expect
          </button>
          <button 
            onClick={() => scrollToSection('book')}
            className="text-[#1A2D3D] font-medium text-left py-2"
          >
            Book
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="text-[#2F9BFF] font-medium text-left py-2 flex items-center gap-2"
          >
            <User size={18} />
            Client Login
          </button>
          <button 
            onClick={() => scrollToSection('book')}
            className="btn-primary text-center"
          >
            Book a session
          </button>
        </div>
      )}
    </nav>
  );
}
