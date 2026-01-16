import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Mail, Phone, Church, Users, Info, Book, Calendar, Heart, Star, LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import { supabase } from '@/integrations/supabase/client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const ICON_MAP: Record<string, LucideIcon> = {
  Church, Users, Info, HelpCircle, Book, Calendar, Heart, Star,
};

interface FAQCategory {
  id: string;
  title: string;
  title_fr: string | null;
  title_pl: string | null;
  icon: string;
  sort_order: number;
}

interface FAQItem {
  id: string;
  category_id: string;
  question: string;
  question_fr: string | null;
  question_pl: string | null;
  answer: string;
  answer_fr: string | null;
  answer_pl: string | null;
  sort_order: number;
}

const FAQ = () => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [items, setItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [catRes, itemRes] = await Promise.all([
      supabase.from('faq_categories').select('*').eq('active', true).order('sort_order'),
      supabase.from('faq_items').select('*').eq('active', true).order('sort_order'),
    ]);
    if (catRes.data) setCategories(catRes.data);
    if (itemRes.data) setItems(itemRes.data);
    setLoading(false);
  };

  const getLocalizedText = (fr: string | null, pl: string | null, fallback: string) => {
    if (i18n.language === 'pl' && pl) return pl;
    return fr || fallback;
  };

  const getItemsForCategory = (categoryId: string) => items.filter(i => i.category_id === categoryId);

  // Fallback data if no database entries
  const fallbackCategories = [
    { title: t('faq.categories.sacraments'), key: 'sacraments', icon: Church,
      questions: [
        { question: t('faq.sacraments.q1'), answer: t('faq.sacraments.a1') },
        { question: t('faq.sacraments.q2'), answer: t('faq.sacraments.a2') },
        { question: t('faq.sacraments.q3'), answer: t('faq.sacraments.a3') },
        { question: t('faq.sacraments.q4'), answer: t('faq.sacraments.a4') },
      ],
    },
    { title: t('faq.categories.parishLife'), key: 'parishLife', icon: Users,
      questions: [
        { question: t('faq.parishLife.q1'), answer: t('faq.parishLife.a1') },
        { question: t('faq.parishLife.q2'), answer: t('faq.parishLife.a2') },
        { question: t('faq.parishLife.q3'), answer: t('faq.parishLife.a3') },
        { question: t('faq.parishLife.q4'), answer: t('faq.parishLife.a4') },
      ],
    },
    { title: t('faq.categories.practicalInfo'), key: 'practicalInfo', icon: Info,
      questions: [
        { question: t('faq.practicalInfo.q1'), answer: t('faq.practicalInfo.a1') },
        { question: t('faq.practicalInfo.q2'), answer: t('faq.practicalInfo.a2') },
        { question: t('faq.practicalInfo.q3'), answer: t('faq.practicalInfo.a3') },
        { question: t('faq.practicalInfo.q4'), answer: t('faq.practicalInfo.a4') },
      ],
    },
  ];

  const hasDbData = categories.length > 0;

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
              <div className="inline-flex items-center justify-center p-4 bg-accent/20 rounded-full mb-6">
                <HelpCircle className="text-accent" size={32} />
              </div>
              <h1 className="text-primary-foreground mb-4">{t('faq.title')}</h1>
              <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
                {t('faq.description')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="section-padding">
          <div className="container-parish max-w-4xl">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : hasDbData ? (
              // Database content
              categories.map((category, categoryIndex) => {
                const IconComponent = ICON_MAP[category.icon] || HelpCircle;
                const categoryItems = getItemsForCategory(category.id);
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                    className="mb-12"
                  >
                    <h2 className="text-2xl font-heading font-bold text-soft-blue mb-6 flex items-center gap-3">
                      <span className="w-12 h-12 bg-soft-blue/10 rounded-xl flex items-center justify-center">
                        <IconComponent className="text-soft-blue" size={24} />
                      </span>
                      {getLocalizedText(category.title_fr, category.title_pl, category.title)}
                    </h2>
                    <Accordion type="single" collapsible className="space-y-3">
                      {categoryItems.map((item, index) => (
                        <AccordionItem
                          key={item.id}
                          value={item.id}
                          className="card-parish border-none px-6 data-[state=open]:shadow-lg transition-shadow"
                        >
                          <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-foreground hover:text-soft-blue hover:no-underline py-5">
                            {getLocalizedText(item.question_fr, item.question_pl, item.question)}
                          </AccordionTrigger>
                          <AccordionContent className="text-base text-muted-foreground pb-5 leading-relaxed">
                            {getLocalizedText(item.answer_fr, item.answer_pl, item.answer)}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </motion.div>
                );
              })
            ) : (
              // Fallback content
              fallbackCategories.map((category, categoryIndex) => {
                const IconComponent = category.icon;
                return (
                  <motion.div
                    key={category.key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                    className="mb-12"
                  >
                    <h2 className="text-2xl font-heading font-bold text-soft-blue mb-6 flex items-center gap-3">
                      <span className="w-12 h-12 bg-soft-blue/10 rounded-xl flex items-center justify-center">
                        <IconComponent className="text-soft-blue" size={24} />
                      </span>
                      {category.title}
                    </h2>
                    <Accordion type="single" collapsible className="space-y-3">
                      {category.questions.map((item, index) => (
                        <AccordionItem
                          key={index}
                          value={`${category.key}-${index}`}
                          className="card-parish border-none px-6 data-[state=open]:shadow-lg transition-shadow"
                        >
                          <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-foreground hover:text-soft-blue hover:no-underline py-5">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-base text-muted-foreground pb-5 leading-relaxed">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </motion.div>
                );
              })
            )}

            {/* Contact CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-16 text-center p-8 bg-muted rounded-2xl"
            >
              <h3 className="text-xl font-heading font-bold text-foreground mb-3">
                {t('faq.moreQuestions')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('faq.moreQuestionsDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact" className="btn-parish">
                  <Mail size={18} />
                  {t('faq.contactUs')}
                </Link>
                <a href="tel:+33123456789" className="btn-parish-outline">
                  <Phone size={18} />
                  +33 1 23 45 67 89
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default FAQ;