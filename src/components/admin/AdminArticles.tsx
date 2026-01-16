import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ImageUpload } from '@/components/ui/image-upload';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

const AdminArticles = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    title_fr: '',
    title_pl: '',
    content_fr: '',
    content_pl: '',
    excerpt_fr: '',
    excerpt_pl: '',
    image_url: '',
    category: '',
    published: false,
    featured: false,
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setArticles(data as Article[]);
    if (error) console.error('Error fetching articles:', error);
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string, lang: 'fr' | 'pl') => {
    if (lang === 'fr') {
      setFormData(prev => ({
        ...prev,
        title_fr: title,
        title: title, // Keep main title synced with FR
        slug: editingArticle ? prev.slug : generateSlug(title),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        title_pl: title,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      title_fr: '',
      title_pl: '',
      content_fr: '',
      content_pl: '',
      excerpt_fr: '',
      excerpt_pl: '',
      image_url: '',
      category: '',
      published: false,
      featured: false,
    });
    setEditingArticle(null);
  };

  const openEditDialog = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      content: article.content || '',
      excerpt: article.excerpt || '',
      title_fr: article.title_fr || article.title || '',
      title_pl: article.title_pl || '',
      content_fr: article.content_fr || article.content || '',
      content_pl: article.content_pl || '',
      excerpt_fr: article.excerpt_fr || article.excerpt || '',
      excerpt_pl: article.excerpt_pl || '',
      image_url: article.image_url || '',
      category: article.category || '',
      published: article.published,
      featured: article.featured || false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title_fr || !formData.slug) {
      toast({ title: 'Erreur', description: 'Titre (FR) et slug requis', variant: 'destructive' });
      return;
    }

    const dataToSend = {
      title: formData.title_fr, // Main title = FR title
      slug: formData.slug,
      content: formData.content_fr,
      excerpt: formData.excerpt_fr,
      title_fr: formData.title_fr,
      title_pl: formData.title_pl || null,
      content_fr: formData.content_fr || null,
      content_pl: formData.content_pl || null,
      excerpt_fr: formData.excerpt_fr || null,
      excerpt_pl: formData.excerpt_pl || null,
      image_url: formData.image_url || null,
      category: formData.category || null,
      published: formData.published,
      featured: formData.featured,
    };

    if (editingArticle) {
      const { error } = await supabase
        .from('articles')
        .update(dataToSend)
        .eq('id', editingArticle.id);
      
      if (error) {
        toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Article mis à jour' });
        fetchArticles();
        setDialogOpen(false);
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('articles')
        .insert([dataToSend]);
      
      if (error) {
        toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Article créé' });
        fetchArticles();
        setDialogOpen(false);
        resetForm();
      }
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('articles')
      .update({ published: !currentStatus })
      .eq('id', id);
    
    if (!error) {
      setArticles(prev => prev.map(a => a.id === id ? { ...a, published: !currentStatus } : a));
      toast({ title: currentStatus ? 'Article dépublié' : 'Article publié' });
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return;
    
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setArticles(prev => prev.filter(a => a.id !== id));
      toast({ title: 'Article supprimé' });
    } else {
      toast({ title: 'Erreur', description: 'Impossible de supprimer', variant: 'destructive' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-heading font-semibold">Gestion des articles</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={18} />
              Nouvel article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? 'Modifier l\'article' : 'Nouvel article'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-de-l-article"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Actualités, Événements..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Image de couverture</Label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                  folder="articles"
                />
              </div>

              <Tabs defaultValue="fr" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
                  <TabsTrigger value="pl">🇵🇱 Polski</TabsTrigger>
                </TabsList>
                
                <TabsContent value="fr" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title_fr">Titre (FR) *</Label>
                    <Input
                      id="title_fr"
                      value={formData.title_fr}
                      onChange={(e) => handleTitleChange(e.target.value, 'fr')}
                      placeholder="Titre de l'article en français"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excerpt_fr">Résumé (FR)</Label>
                    <Textarea
                      id="excerpt_fr"
                      value={formData.excerpt_fr}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt_fr: e.target.value }))}
                      placeholder="Court résumé en français..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contenu (FR)</Label>
                    <RichTextEditor
                      content={formData.content_fr}
                      onChange={(content) => setFormData(prev => ({ ...prev, content_fr: content }))}
                      placeholder="Contenu de l'article en français..."
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="pl" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title_pl">Titre (PL)</Label>
                    <Input
                      id="title_pl"
                      value={formData.title_pl}
                      onChange={(e) => handleTitleChange(e.target.value, 'pl')}
                      placeholder="Tytuł artykułu po polsku"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excerpt_pl">Résumé (PL)</Label>
                    <Textarea
                      id="excerpt_pl"
                      value={formData.excerpt_pl}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt_pl: e.target.value }))}
                      placeholder="Krótkie podsumowanie po polsku..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contenu (PL)</Label>
                    <RichTextEditor
                      content={formData.content_pl}
                      onChange={(content) => setFormData(prev => ({ ...prev, content_pl: content }))}
                      placeholder="Treść artykułu po polsku..."
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
                <div className="flex items-center gap-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                  />
                  <Label htmlFor="published">Publier immédiatement</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                  />
                  <Label htmlFor="featured" className="flex items-center gap-1">
                    ⭐ Mettre à la une
                  </Label>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  <X size={16} />
                  Annuler
                </Button>
                <Button type="submit">
                  <Save size={16} />
                  {editingArticle ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Chargement...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Traductions</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>À la une</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Aucun article
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title_fr || article.title}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {article.title_fr && <Badge variant="outline">FR</Badge>}
                      {article.title_pl && <Badge variant="outline">PL</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{article.category || '-'}</TableCell>
                  <TableCell>
                    {article.published ? (
                      <Badge variant="default" className="bg-green-600">Publié</Badge>
                    ) : (
                      <Badge variant="secondary">Brouillon</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {article.featured && (
                      <Badge variant="outline" className="border-primary text-primary">⭐</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(article.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => togglePublished(article.id, article.published)}>
                        {article.published ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(article)}>
                        <Edit size={14} />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteArticle(article.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AdminArticles;