import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar as CalendarIcon, Facebook, Twitter, Linkedin, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { sanitizeHtml } from '@/lib/sanitize';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  title_fr: string | null;
  title_pl: string | null;
  content_fr: string | null;
  content_pl: string | null;
  excerpt_fr: string | null;
  excerpt_pl: string | null;
  image_url: string | null;
  category: string | null;
  created_at: string;
}

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const currentLang = i18n.language?.startsWith('pl') ? 'pl' : 'fr';

  useEffect(() => {
    if (slug) {
      fetchArticle(slug);
    }
  }, [slug]);

  const fetchArticle = async (articleSlug: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', articleSlug)
      .eq('published', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching article:', error);
    }
    
    if (data) {
      setArticle(data as Article);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(currentLang === 'pl' ? 'pl-PL' : 'fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getLocalizedTitle = (article: Article) => {
    if (currentLang === 'pl' && article.title_pl) return article.title_pl;
    return article.title_fr || article.title;
  };

  const getLocalizedContent = (article: Article) => {
    if (currentLang === 'pl' && article.content_pl) return article.content_pl;
    return article.content_fr || article.content;
  };

  const getLocalizedExcerpt = (article: Article) => {
    if (currentLang === 'pl' && article.excerpt_pl) return article.excerpt_pl;
    return article.excerpt_fr || article.excerpt;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="section-padding">
          <div className="container-parish max-w-4xl">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-48 mb-8" />
            <Skeleton className="aspect-video w-full mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="section-padding">
          <div className="container-parish text-center py-16">
            <h1 className="text-2xl font-heading font-bold text-foreground mb-4">
              {t('articles.notFound')}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t('articles.notFoundDesc')}
            </p>
            <Link to="/articles" className="btn-parish">
              <ArrowLeft size={18} />
              {t('articles.backToArticles')}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const content = getLocalizedContent(article);
  const excerpt = getLocalizedExcerpt(article);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <article className="section-padding">
          <div className="container-parish max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <Link
                  to="/articles"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft size={18} />
                  {t('articles.backToArticles')}
                </Link>

                {article.category && (
                  <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-sm font-semibold rounded-full">
                    {article.category}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                {getLocalizedTitle(article)}
              </h1>

              <div className="flex items-center gap-4 text-muted-foreground mb-8">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={16} />
                  <time>{formatDate(article.created_at)}</time>
                </div>
              </div>

              {article.image_url && (
                <div className="relative overflow-hidden rounded-xl mb-8">
                  <img
                    src={article.image_url}
                    alt={getLocalizedTitle(article)}
                    className="w-full aspect-video object-cover"
                  />
                </div>
              )}

              {content ? (
                <div 
                  className="prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
                />
              ) : excerpt ? (
                <p className="text-lg text-muted-foreground">{excerpt}</p>
              ) : (
                <p className="text-muted-foreground italic">{t('articles.noContent')}</p>
              )}

              {/* Social Share Section */}
              <div className="mt-12 pt-8 border-t border-border">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-2 text-muted-foreground font-medium">
                    <Share2 size={18} />
                    {currentLang === 'pl' ? 'Udostępnij' : 'Partager'}
                  </span>
                  <div className="flex items-center gap-3">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1877F2] text-white hover:opacity-90 transition-opacity"
                      aria-label="Partager sur Facebook"
                    >
                      <Facebook size={20} />
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(getLocalizedTitle(article))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1DA1F2] text-white hover:opacity-90 transition-opacity"
                      aria-label="Partager sur Twitter"
                    >
                      <Twitter size={20} />
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0A66C2] text-white hover:opacity-90 transition-opacity"
                      aria-label="Partager sur LinkedIn"
                    >
                      <Linkedin size={20} />
                    </a>
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getLocalizedTitle(article) + ' ' + window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366] text-white hover:opacity-90 transition-opacity"
                      aria-label="Partager sur WhatsApp"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default ArticleDetail;