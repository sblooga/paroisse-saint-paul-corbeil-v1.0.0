import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logoImage from '@/assets/logo.png';
import { supabase } from '@/integrations/supabase/client';

interface FooterLink {
  id: string;
  label: string;
  label_fr: string | null;
  label_pl: string | null;
  url: string;
}

const Footer = () => {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);

  useEffect(() => {
    const fetchLinks = async () => {
      const { data } = await supabase
        .from('footer_links')
        .select('id, label, label_fr, label_pl, url')
        .eq('active', true)
        .order('sort_order', { ascending: true });
      
      if (data) setFooterLinks(data);
    };
    fetchLinks();
  }, []);

  const getLinkLabel = (link: FooterLink) => {
    if (i18n.language === 'pl' && link.label_pl) return link.label_pl;
    if (i18n.language === 'fr' && link.label_fr) return link.label_fr;
    return link.label_fr || link.label;
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container-parish section-padding pb-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logoImage}
                alt={t('footer.parishName')}
                className="h-12 w-12 object-cover rounded-full"
              />
              <h3 className="text-xl font-heading font-bold">
                {t('footer.parishName')}
              </h3>
            </div>
            <p className="text-primary-foreground/70 text-sm mb-6">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, label: 'Facebook' },
                { icon: Instagram, label: 'Instagram' },
                { icon: Youtube, label: 'YouTube' },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="p-2 bg-primary-foreground/10 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-heading font-bold mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-accent shrink-0 mt-0.5" />
                <span>118 boulevard John Kennedy<br />Moulin-Galant, 91100 Corbeil-Essonnes</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-accent shrink-0" />
                <a href="tel:+33164960901" className="hover:text-accent transition-colors">
                  01 64 96 09 01
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-accent shrink-0" />
                <a href="mailto:paroissestpaul.corbeil@gmail.com" className="hover:text-accent transition-colors">
                  paroissestpaul.corbeil@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Horaires Secrétariat */}
          <div>
            <h4 className="text-lg font-heading font-bold mb-4">{t('footer.secretariat')}</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-3">
                <Clock size={18} className="text-secondary shrink-0" />
                <span>{t('footer.hours.weekdays')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock size={18} className="text-secondary shrink-0" />
                <span>{t('footer.hours.saturday')}</span>
              </li>
            </ul>
            <div className="mt-6">
              <a href="#don" className="inline-flex items-center gap-2 btn-accent text-sm py-2 px-4">
                <Heart size={16} />
                {t('footer.donate')}
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-heading font-bold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    className="text-primary-foreground/70 hover:text-accent transition-colors"
                  >
                    {getLinkLabel(link)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-parish py-6 px-4 pb-20 md:pb-6">
          <div className="flex flex-col items-center gap-4 text-sm text-primary-foreground/50">
            <p className="text-center">© {currentYear} {t('footer.parishName')}. {t('footer.rights')}.</p>
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2">
              <Link to="/mentions-legales" className="hover:text-accent transition-colors">
                {t('footer.legal')}
              </Link>
              <Link to="/confidentialite" className="hover:text-accent transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link to="/cookies" className="hover:text-accent transition-colors">
                {t('footer.cookies')}
              </Link>
              <Link to="/auth" className="hover:text-accent transition-colors">
                {t('footer.admin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;