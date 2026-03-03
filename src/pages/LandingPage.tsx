import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import HeroSection from '@/sections/HeroSection';
import WhatToExpectSection from '@/sections/WhatToExpectSection';
import FirstVisitSection from '@/sections/FirstVisitSection';
import CommonIssuesSection from '@/sections/CommonIssuesSection';
import TechniquesSection from '@/sections/TechniquesSection';
import PreventionSection from '@/sections/PreventionSection';
import RecoverySection from '@/sections/RecoverySection';
import WhyZonaSection from '@/sections/WhyZonaSection';
import BookSection from '@/sections/BookSection';
import ContactSection from '@/sections/ContactSection';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Noise Overlay */}
      <div className="noise-overlay" />

      {/* Navigation */}
      <Navigation />

      {/* Client Portal Button */}
      <button
        onClick={() => navigate('/login')}
        className="fixed bottom-6 right-6 z-50 btn-primary shadow-lg flex items-center gap-2"
      >
        Client Portal
      </button>

      {/* Main Content */}
      <main className="relative">
        <HeroSection />
        <WhatToExpectSection />
        <FirstVisitSection />
        <CommonIssuesSection />
        <TechniquesSection />
        <PreventionSection />
        <RecoverySection />
        <WhyZonaSection />
        <BookSection />
        <ContactSection />
      </main>
    </div>
  );
}
