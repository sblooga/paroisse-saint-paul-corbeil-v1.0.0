import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import HeroSlider from '@/components/HeroSlider';
import MassSchedule from '@/components/MassSchedule';
import FeaturedArticles from '@/components/FeaturedArticles';
import TeamSection from '@/components/TeamSection';
import DonationCTA from '@/components/DonationCTA';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      // Small delay to ensure the element is rendered
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSlider />
        <MassSchedule />
        <FeaturedArticles />
        <TeamSection />
        <DonationCTA />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
