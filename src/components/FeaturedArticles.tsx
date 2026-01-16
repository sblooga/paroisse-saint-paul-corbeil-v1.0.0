import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar as CalendarIcon, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Article {
  id: string;
  title: string;
  title_fr: string | null;
  title_pl: string | null;
  slug: string;
  excerpt: string | null;
  excerpt_fr: string | null;
  excerpt_pl: string | null;
  image_url: string | null;
  category: string | null;
  featured: boolean | null;
  created_at: string;
}

const FeaturedArticles = () => {
  const { t, i18n } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const currentLang = i18n.language?.startsWith('pl') ? 'pl' : 'fr';

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    // Fetch featured articles first, then recent ones
    const { data, error } = await supabase
      .from('articles')
      .select('id, title, title_fr, title_pl, slug, excerpt, excerpt_fr, excerpt_pl, image_url, category, featured, created_at')
      .eq('published', true)
      .order('featured', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(3);

    if (data) setArticles(data as Article[]);
    if (error) console.error('Error fetching articles:', error);
    setLoading(false);
  };

  const getLocalizedTitle = (article: Article) => {
    if (currentLang === 'pl' && article.title_pl) return article.title_pl;
    if (article.title_fr) return article.title_fr;
    return article.title;
  };

  const getLocalizedExcerpt = (article: Article) => {
    if (currentLang === 'pl' && article.excerpt_pl) return article.excerpt_pl;
    if (article.excerpt_fr) return article.excerpt_fr;
    return article.excerpt;
  };

  const formatDate = (dateString: string) => {
    const locale = i18n.language === 'pl' ? 'pl-PL' : 'fr-FR';
    return new Date(dateString).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <section id="actualites" className="section-padding bg-background">
      <div className="container-parish">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-secondary font-semibold uppercase tracking-wider text-sm">
            {t('articles.subtitle')}
          </span>
          <h2 className="mt-2 text-foreground">{t('articles.headline')}</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {t('articles.description')}
          </p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card-parish">
                <Skeleton className="aspect-[3/2] w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('articles.noArticles')}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-parish group"
              >
                <div className="relative overflow-hidden aspect-[3/2]">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">{t('common.noResults')}</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {article.featured && (
                      <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full flex items-center gap-1">
                        <Star size={12} className="fill-current" />
                        {t('articles.featured')}
                      </span>
                    )}
                    {article.category && (
                      <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                        {article.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                    <CalendarIcon size={14} />
                    <time>{formatDate(article.created_at)}</time>
                  </div>

                  <h3 className="text-xl font-heading font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {getLocalizedTitle(article)}
                  </h3>

                  {getLocalizedExcerpt(article) && (
                    <p className="text-muted-foreground line-clamp-3 mb-4">
                      {getLocalizedExcerpt(article)}
                    </p>
                  )}

                  <Link
                    to={`/articles/${article.slug}`}
                    className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
                  >
                    {t('common.readMore')}
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link to="/articles" className="btn-parish-outline">
            {t('articles.seeAllNews')}
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedArticles;
