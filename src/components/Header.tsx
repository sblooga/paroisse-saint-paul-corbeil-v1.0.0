import { useState, useEffect } from 'react';
import { Menu, X, Search, Heart, Phone, Facebook, Instagram, Youtube } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';
import HashLink from './HashLink';
import SearchDialog from './SearchDialog';
import logoImage from '@/assets/logo.png';

const Header = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('common.home'), href: '/' },
    { name: t('common.parish'), href: '/paroisse' },
    { name: t('common.lifeStages'), href: '/etapes-de-vie' },
    { name: t('common.team'), href: '/equipe' },
    { name: t('common.schedule'), href: '/horaires' },
    { name: t('common.news'), href: '/articles' },
    { name: t('common.downloads'), href: '/telechargements' },
    { name: t('common.contact'), href: '/contact' },
    { name: t('common.faq'), href: '/faq' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-2 px-4">
        <div className="container-parish flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <Link to="/contact" className="flex items-center gap-2 hover:text-accent transition-colors">
              <Phone size={14} />
              <span className="hidden sm:inline">{t('common.contact')}</span>
            </Link>
            <HashLink to={isHomePage ? '#don' : '/#don'} className="flex items-center gap-2 hover:text-accent transition-colors">
              <Heart size={14} />
              <span>{t('common.donate')}</span>
            </HashLink>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="hover:text-accent transition-colors hover:scale-110 transform"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
            <LanguageSelector variant="compact" className="ml-4" />
            <div className="ml-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 bg-background ${
          isScrolled 
            ? 'shadow-soft backdrop-blur-md bg-background/98' 
            : ''
        }`}
      >
        <div className="container-parish flex items-center justify-between py-4 px-4">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={logoImage} 
              alt={t('header.parishName')}
              className="h-16 w-16 md:h-20 md:w-20 object-contain rounded-full shadow-md"
            />
            <div className="hidden md:block">
              <h1 className="text-lg font-heading font-bold text-foreground leading-tight">
                {t('header.parishName')}
              </h1>
              <p className="text-xs text-muted-foreground">{t('header.parishSubtitle')}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isHash = Boolean((link as any).isHash) || link.href.startsWith('#') || link.href.includes('/#');
              const isActive = link.href === location.pathname;
              
              if (isHash) {
                return (
                  <HashLink
                    key={link.name}
                    to={link.href}
                    className={`text-foreground/80 hover:text-primary font-medium transition-colors relative group ${isActive ? 'text-primary' : ''}`}
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                  </HashLink>
                );
              }
              
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-foreground/80 hover:text-primary font-medium transition-colors relative group ${isActive ? 'text-primary' : ''}`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-accent transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSearchOpen(true)}
              aria-label={t('common.search')}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <Search size={20} className="text-foreground" />
            </button>
            <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
            
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-80 bg-card shadow-2xl z-50 lg:hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <LanguageSelector />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <nav className="flex flex-col gap-4">
                {navLinks.map((link, index) => {
                  const isHash = Boolean((link as any).isHash) || link.href.startsWith('#') || link.href.includes('/#');
                  
                  if (isHash) {
                    return (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <HashLink
                          to={link.href}
                          onClick={() => setIsMenuOpen(false) as any}
                          className="block text-xl font-heading font-semibold text-foreground hover:text-primary transition-colors py-2 border-b border-border"
                        >
                          {link.name}
                        </HashLink>
                      </motion.div>
                    );
                  }
                  
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-xl font-heading font-semibold text-foreground hover:text-primary transition-colors py-2 border-b border-border"
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="mt-8 pt-8 border-t border-border">
                <HashLink
                  to={isHomePage ? '#don' : '/#don'}
                  onClick={() => setIsMenuOpen(false) as any}
                  className="btn-accent w-full text-center"
                >
                  <Heart size={18} />
                  {t('common.donate')}
                </HashLink>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
