import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Contact = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
    newsletter: false,
    rgpd: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category) {
      toast({
        title: t('contact.form.categoryRequired'),
        description: t('contact.form.categoryRequiredDesc'),
        variant: "destructive",
      });
      return;
    }

    if (!formData.rgpd) {
      toast({
        title: t('contact.form.consentRequired'),
        description: t('contact.form.consentRequiredDesc'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Build subject with category prefix if selected
      const categoryLabel = formData.category ? `[${formData.category.toUpperCase()}] ` : '';
      const fullSubject = `${categoryLabel}${formData.subject.trim()}`;

      const { error: messageError } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          subject: fullSubject,
          message: formData.message.trim(),
          newsletter_optin: formData.newsletter,
        });

      if (messageError) throw messageError;

      if (formData.newsletter) {
        const { error: subscriberError } = await supabase
          .from('newsletter_subscribers')
          .upsert(
            { email: formData.email.trim().toLowerCase() },
            { onConflict: 'email' }
          );
        
        if (subscriberError) {
          console.error('Newsletter subscription error:', subscriberError);
        }
      }

      toast({
        title: t('contact.form.success'),
        description: t('contact.form.successDesc'),
      });
      
      setFormData({
        name: '',
        email: '',
        category: '',
        subject: '',
        message: '',
        newsletter: false,
        rgpd: false,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: t('contact.form.error'),
        description: t('contact.form.errorDesc'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-primary py-20 px-4">
          <div className="container-parish text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-primary-foreground mb-4">{t('contact.title')}</h1>
              <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
                {t('contact.description')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="section-padding">
          <div className="container-parish">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Left: Map & Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Google Maps */}
                <div className="rounded-xl overflow-hidden shadow-lg mb-8 aspect-video relative group">
                  <iframe
                    src="https://www.google.com/maps?q=118+Boulevard+John+Kennedy,+91100+Corbeil-Essonnes,+France&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Église Saint-Paul de Moulin-Galant"
                    className="pointer-events-none md:pointer-events-auto"
                  />
                  {/* Overlay cliquable pour tablettes/mobiles */}
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=118+Boulevard+John+Kennedy+91100+Corbeil-Essonnes+France"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-primary/0 hover:bg-primary/10 transition-colors md:hidden"
                    aria-label={t('contact.info.openMap')}
                  >
                    <span className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {t('contact.info.openMap')}
                    </span>
                  </a>
                </div>

                {/* Contact Info Cards */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="card-parish p-5">
                    <div className="flex items-start gap-4">
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=118+Boulevard+John+Kennedy+91100+Corbeil-Essonnes+France"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer"
                        aria-label={t('contact.info.openMap')}
                      >
                        <MapPin className="text-primary" size={24} />
                      </a>
                      <div>
                        <h4 className="font-heading font-bold text-foreground mb-1">{t('contact.info.address')}</h4>
                        <p className="text-muted-foreground text-sm whitespace-pre-line">
                          {t('contact.info.addressValue')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card-parish p-5">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-secondary/20 rounded-lg">
                        <Phone className="text-secondary" size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-heading font-bold text-foreground mb-1">{t('contact.info.phone')}</h4>
                        <a 
                          href="tel:+33164960901" 
                          className="text-muted-foreground text-sm hover:text-primary transition-colors"
                        >
                          01 64 96 09 01
                        </a>
                        <a
                          href="https://wa.me/33164960901"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-full transition-all hover:scale-105 animate-pulse hover:animate-none"
                        >
                          <MessageCircle size={14} />
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="card-parish p-5">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-accent/20 rounded-lg">
                        <Mail className="text-accent" size={24} />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-foreground mb-1">{t('contact.info.email')}</h4>
                        <a 
                          href="mailto:paroissestpaul.corbeil@gmail.com" 
                          className="text-muted-foreground text-sm hover:text-primary transition-colors"
                        >
                          paroissestpaul.corbeil@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="card-parish p-5">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Clock className="text-primary" size={24} />
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-foreground mb-1">{t('contact.info.hours')}</h4>
                        <p className="text-muted-foreground text-sm whitespace-pre-line">
                          {t('contact.info.hoursValue')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="card-parish p-8">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                    {t('contact.form.sendMessage')}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {t('contact.form.sendMessageDesc')}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('contact.form.name')} *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder={t('contact.form.namePlaceholder')}
                          required
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('contact.form.email')} *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder={t('contact.form.emailPlaceholder')}
                          required
                          className="bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">{t('contact.form.category')} *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder={t('contact.form.categoryPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="secretariat">{t('contact.form.categories.secretariat')}</SelectItem>
                          <SelectItem value="pretre">{t('contact.form.categories.priest')}</SelectItem>
                          <SelectItem value="animateur">{t('contact.form.categories.animator')}</SelectItem>
                          <SelectItem value="service">{t('contact.form.categories.service')}</SelectItem>
                          <SelectItem value="chorale">{t('contact.form.categories.choir')}</SelectItem>
                          <SelectItem value="bapteme">{t('contact.form.categories.baptism')}</SelectItem>
                          <SelectItem value="mariage">{t('contact.form.categories.wedding')}</SelectItem>
                          <SelectItem value="obseques">{t('contact.form.categories.funeral')}</SelectItem>
                          <SelectItem value="autre">{t('contact.form.categories.other')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">{t('contact.form.subject')} *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder={t('contact.form.subjectPlaceholder')}
                        required
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">{t('contact.form.message')} *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder={t('contact.form.messagePlaceholder')}
                        rows={5}
                        required
                        className="bg-background resize-none"
                      />
                    </div>

                    {/* Newsletter Opt-in */}
                    <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                      <Checkbox
                        id="newsletter"
                        checked={formData.newsletter}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, newsletter: checked as boolean }))
                        }
                      />
                      <div className="space-y-1">
                        <Label htmlFor="newsletter" className="cursor-pointer font-medium">
                          {t('contact.form.newsletter')}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {t('contact.form.newsletterDesc')}
                        </p>
                      </div>
                    </div>

                    {/* RGPD Consent */}
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="rgpd"
                        checked={formData.rgpd}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, rgpd: checked as boolean }))
                        }
                        required
                      />
                      <Label htmlFor="rgpd" className="text-sm text-muted-foreground cursor-pointer">
                        {t('contact.form.consent')}{' '}
                        <a href="#" className="text-primary hover:underline">
                          {t('contact.form.privacyPolicy')}
                        </a>
                        . *
                      </Label>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full btn-parish"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          {t('contact.form.sending')}
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          {t('contact.form.send')}
                        </>
                      )}
                    </Button>
                  </form>
                </div>

                {/* Trust Indicators */}
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle size={16} className="text-secondary" />
                  <span>{t('contact.form.responseTime')}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default Contact;