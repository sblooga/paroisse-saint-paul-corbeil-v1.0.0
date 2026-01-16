import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COOKIE_CONSENT_KEY = 'cookie_consent';
const COOKIE_CONSENT_EXPIRY = 365 * 24 * 60 * 60 * 1000; // 1 year in ms

interface CookieConsentData {
  accepted: boolean;
  timestamp: number;
}

const CookieConsent = () => {
  const { i18n } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);
  const isFrench = i18n.language === 'fr';

  useEffect(() => {
    const consentData = localStorage.getItem(COOKIE_CONSENT_KEY);
    
    if (consentData) {
      try {
        const parsed: CookieConsentData = JSON.parse(consentData);
        const now = Date.now();
        
        // Check if consent has expired (1 year)
        if (now - parsed.timestamp > COOKIE_CONSENT_EXPIRY) {
          localStorage.removeItem(COOKIE_CONSENT_KEY);
          setShowBanner(true);
        }
        // Consent is still valid, don't show banner
      } catch {
        // Invalid data, show banner
        localStorage.removeItem(COOKIE_CONSENT_KEY);
        setShowBanner(true);
      }
    } else {
      // No consent data, show banner
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    const consentData: CookieConsentData = {
      accepted: true,
      timestamp: Date.now(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    setShowBanner(false);
  };

  const handleDecline = () => {
    const consentData: CookieConsentData = {
      accepted: false,
      timestamp: Date.now(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    setShowBanner(false);
  };

  // Just hide temporarily - will show again on next visit
  const handleDismiss = () => {
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="bg-card border border-border rounded-xl shadow-xl p-4 md:p-6 relative">
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={isFrench ? 'Fermer' : 'Zamknij'}
              >
                <X size={20} />
              </button>

              <div className="pr-8">
                <h3 className="font-playfair text-lg font-semibold text-foreground mb-2">
                  {isFrench ? '🍪 Gestion des cookies' : '🍪 Zarządzanie cookies'}
                </h3>
                
                <p className="text-foreground/70 text-sm mb-4">
                  {isFrench 
                    ? 'Ce site utilise des cookies essentiels pour améliorer votre expérience de navigation, mémoriser vos préférences de langue et de thème.'
                    : 'Ta strona używa niezbędnych cookies, aby poprawić Twoje doświadczenie przeglądania i zapamiętać Twoje preferencje językowe i motywu.'}
                  {' '}
                  <Link 
                    to="/cookies" 
                    className="text-primary hover:underline"
                  >
                    {isFrench ? 'En savoir plus' : 'Dowiedz się więcej'}
                  </Link>
                </p>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleAccept}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isFrench ? 'Accepter' : 'Akceptuję'}
                  </Button>
                  <Button
                    onClick={handleDecline}
                    variant="outline"
                  >
                    {isFrench ? 'Refuser' : 'Odrzucam'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
