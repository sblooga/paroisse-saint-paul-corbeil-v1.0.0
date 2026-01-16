import { useCallback, useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import HashLink from '@/components/HashLink';

import heroChurch from '@/assets/hero-church-1.jpg';
import heroCommunity from '@/assets/hero-community.jpg';
import heroCelebration from '@/assets/hero-celebration.jpg';

const slides = [
  {
    id: 1,
    image: heroChurch,
    titleKey: 'hero.slides.slide1.title',
    subtitleKey: 'hero.slides.slide1.subtitle',
  },
  {
    id: 2,
    image: heroCommunity,
    titleKey: 'hero.slides.slide2.title',
    subtitleKey: 'hero.slides.slide2.subtitle',
  },
  {
    id: 3,
    image: heroCelebration,
    titleKey: 'hero.slides.slide3.title',
    subtitleKey: 'hero.slides.slide3.subtitle',
  },
];

const HeroSlider = () => {
  const { t } = useTranslation();
  const autoplay = useMemo(() => Autoplay({ delay: 5000, stopOnInteraction: false }), []);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [autoplay]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const next = emblaApi.selectedScrollSnap();
    setSelectedIndex((prev) => (prev === next ? prev : next));
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden">
      <div ref={emblaRef} className="h-full">
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="flex-[0_0_100%] min-w-0 relative h-full"
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${slide.image})`,
                }}
              />
              <div className="absolute inset-0 overlay-gradient" />
              
              {selectedIndex === index && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl"
                  >
                    <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 bg-card/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <span className="text-4xl md:text-5xl">✝️</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground mb-4 drop-shadow-lg whitespace-pre-line">
                      {t(slide.titleKey)}
                    </h2>
                    <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 drop-shadow-md">
                      {t(slide.subtitleKey)}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <HashLink to="#horaires" className="btn-accent">
                        {t('hero.massSchedule')}
                      </HashLink>
                      <HashLink
                        to="/contact"
                        className="btn-parish-outline border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                      >
                        {t('hero.contactUs')}
                      </HashLink>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-card/30 backdrop-blur-sm rounded-full text-primary-foreground hover:bg-card/50 transition-all"
        aria-label={t('hero.prevSlide')}
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-card/30 backdrop-blur-sm rounded-full text-primary-foreground hover:bg-card/50 transition-all"
        aria-label={t('hero.nextSlide')}
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === selectedIndex
                ? 'bg-accent w-8'
                : 'bg-primary-foreground/50 hover:bg-primary-foreground/70'
            }`}
            aria-label={`${t('hero.goToSlide')} ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;