import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  title_fr: string | null;
  title_pl: string | null;
  excerpt_fr: string | null;
  excerpt_pl: string | null;
  image_url: string | null;
  category: string | null;
  created_at: string;
}

const ARTICLES_PER_PAGE = 9;

const Articles = () => {
  const { t, i18n } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const currentLang = i18n.language?.startsWith('pl') ? 'pl' : 'fr';

  useEffect(() => {
    fetchArticles();
  }, [currentPage]);

  const fetchArticles = async () => {
    setLoading(true);
    const from = (currentPage - 1) * ARTICLES_PER_PAGE;
    const to = from + ARTICLES_PER_PAGE - 1;

    const { data, error, count } = await supabase
      .from('articles')
      .select('id, title, slug, excerpt, title_fr, title_pl, excerpt_fr, excerpt_pl, image_url, category, created_at', { count: 'exact' })
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (data) setArticles(data as Article[]);
    if (count !== null) setTotalCount(count);
    if (error) console.error('Error fetching articles:', error);
    setLoading(false);
  };

  const totalPages = Math.ceil(totalCount / ARTICLES_PER_PAGE);

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

  const getLocalizedExcerpt = (article: Article) => {
    if (currentLang === 'pl' && article.excerpt_pl) return article.excerpt_pl;
    return article.excerpt_fr || article.excerpt;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-primary/5 py-16">
          <div className="container-parish text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-foreground mb-4">{t('articles.title')}</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                {t('articles.subtitle')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="section-padding">
          <div className="container-parish">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
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
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">{t('articles.noArticles')}</p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {articles.map((article, index) => (
                    <Link key={article.id} to={`/articles/${article.slug}`} className="block">
                      <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="card-parish group cursor-pointer h-full"
                      >
                        <div className="relative overflow-hidden aspect-[3/2]">
                          {article.image_url ? (
                            <img
                              src={article.image_url}
                              alt={getLocalizedTitle(article)}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground">{t('articles.noImage')}</span>
                            </div>
                          )}
                          {article.category && (
                            <div className="absolute top-4 left-4">
                              <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                                {article.category}
                              </span>
                            </div>
                          )}
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

                          <span className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                            {t('articles.readMore')}
                            <ArrowRight size={18} />
                          </span>
                        </div>
                      </motion.article>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={18} />
                    </Button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight size={18} />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Articles;