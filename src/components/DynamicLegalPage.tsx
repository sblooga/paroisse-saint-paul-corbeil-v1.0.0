import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import { Skeleton } from '@/components/ui/skeleton';
import { sanitizeHtml } from '@/lib/sanitize';
interface DynamicLegalPageProps {
  slug: string;
  fallbackTitleFr: string;
  fallbackTitlePl: string;
}

interface PageData {
  title_fr: string | null;
  title_pl: string | null;
  content_fr: string | null;
  content_pl: string | null;
}

const DynamicLegalPage = ({ slug, fallbackTitleFr, fallbackTitlePl }: DynamicLegalPageProps) => {
  const { i18n } = useTranslation();
  const isFrench = i18n.language === 'fr';
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchPage = async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('title_fr, title_pl, content_fr, content_pl')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (!error && data) {
        setPageData(data);
      }
      setLoading(false);
    };

    fetchPage();
  }, [slug]);

  const title = isFrench 
    ? (pageData?.title_fr || fallbackTitleFr)
    : (pageData?.title_pl || fallbackTitlePl);

  const content = isFrench 
    ? pageData?.content_fr
    : pageData?.content_pl;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {loading ? (
            <>
              <Skeleton className="h-12 w-3/4 mb-8" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
                <Skeleton className="h-6 w-4/5" />
              </div>
            </>
          ) : (
            <>
              <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-8">
                {title}
              </h1>

              {content ? (
                <div 
                  className="prose prose-lg max-w-none text-foreground/80 
                    [&_h2]:font-playfair [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mb-4 [&_h2]:mt-8
                    [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-4 [&_h3]:mb-2
                    [&_p]:mb-4
                    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2
                    [&_li]:text-foreground/80"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
                />
              ) : (
                <p className="text-foreground/60">
                  {isFrench 
                    ? 'Contenu non disponible.'
                    : 'Treść niedostępna.'}
                </p>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

export default DynamicLegalPage;
