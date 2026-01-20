import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { sanitizeHtml } from '@/lib/sanitize';

interface PageData {
  title: string | null;
  title_fr: string | null;
  title_pl: string | null;
  content: string | null;
  content_fr: string | null;
  content_pl: string | null;
}

const PageView = () => {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const isFrench = i18n.language?.startsWith('fr');
  const isPolish = i18n.language?.startsWith('pl');
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;
      const { data, error } = await supabase
        .from('pages')
        .select('title, title_fr, title_pl, content, content_fr, content_pl')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (!error && data) {
        setPage(data);
      }
      setLoading(false);
    };
    fetchPage();
  }, [slug]);

  const title = isFrench
    ? page?.title_fr || page?.title || slug
    : isPolish
      ? page?.title_pl || page?.title || slug
      : page?.title || slug;

  const content = isFrench
    ? page?.content_fr || page?.content
    : isPolish
      ? page?.content_pl || page?.content
      : page?.content;

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
          ) : page ? (
            <>
              <h1 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-8">
                {title}
              </h1>
              {content ? (
                <div
                  className="prose prose-lg max-w-none text-foreground/80 
                    [&_h1]:font-playfair [&_h2]:font-playfair [&_h3]:font-playfair
                    [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl
                    [&_p]:font-sans [&_p]:text-base [&_p]:leading-relaxed
                    [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2
                    [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:font-sans
                    [&_.embed-video]:aspect-video [&_.embed-video]:w-full [&_.embed-video]:rounded-lg
                    [&_.float-left]:float-left [&_.float-left]:mr-4 [&_.float-right]:float-right [&_.float-right]:ml-4"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
                />
              ) : (
                <p className="text-foreground/60">
                  {isFrench ? 'Contenu non disponible.' : 'Treść niedostępna.'}
                </p>
              )}
            </>
          ) : (
            <p className="text-foreground/60">Page introuvable.</p>
          )}
        </div>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default PageView;
