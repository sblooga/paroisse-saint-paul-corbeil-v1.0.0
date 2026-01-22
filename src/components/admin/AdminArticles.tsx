import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X } from 'lucide-react';
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
import { useBackendAuth } from '@/hooks/useBackendAuth';

interface Article {
  id: string;
  slug: string;
  title_fr: string | null;
  title_pl: string | null;
  content_fr: string | null;
  content_pl: string | null;
  excerpt_fr: string | null;
  excerpt_pl: string | null;
  imageUrl: string | null;
  category: string | null;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminArticles = () => {
  const { toast } = useToast();
  const { token } = useBackendAuth();
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:10000/api').replace(/\/$/, '');

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    slug: '',
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

  const authHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/articles/all`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Chargement impossible');
      const data = await res.json();
      setArticles(data as Article[]);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les articles', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
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
      slug: '',
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
      slug: article.slug,
      title_fr: article.title_fr || '',
      title_pl: article.title_pl || '',
      content_fr: article.content_fr || '',
      content_pl: article.content_pl || '',
      excerpt_fr: article.excerpt_fr || '',
      excerpt_pl: article.excerpt_pl || '',
      image_url: article.imageUrl || '',
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
      slug: formData.slug,
      title_fr: formData.title_fr,
      title_pl: formData.title_pl || null,
      content_fr: formData.content_fr || null,
      content_pl: formData.content_pl || null,
      excerpt_fr: formData.excerpt_fr || null,
      excerpt_pl: formData.excerpt_pl || null,
      imageUrl: formData.image_url || null,
      category: formData.category || null,
      published: formData.published,
      featured: formData.featured,
    };

    const method = editingArticle ? 'PUT' : 'POST';
    const url = editingArticle ? `${apiBase}/articles/${editingArticle.id}` : `${apiBase}/articles`;

    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(dataToSend),
      });
      if (!res.ok) throw new Error('Enregistrement impossible');
      toast({ title: editingArticle ? 'Article mis à jour' : 'Article créé' });
      fetchArticles();
      setDialogOpen(false);
      resetForm();
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message || 'Enregistrement impossible', variant: 'destructive' });
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${apiBase}/articles/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ published: !currentStatus }),
      });
      if (res.ok) {
        setArticles(prev => prev.map(a => a.id === id ? { ...a, published: !currentStatus } : a));
        toast({ title: currentStatus ? 'Article dépublié' : 'Article publié' });
      } else {
        throw new Error('Impossible de mettre à jour');
      }
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return;
    try {
      const res = await fetch(`${apiBase}/articles/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        setArticles(prev => prev.filter(a => a.id !== id));
        toast({ title: 'Article supprimé' });
      } else {
        throw new Error('Impossible de supprimer');
      }
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
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
                    placeholder="Actualités, évènements..."
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
                      placeholder="Tytul artykulu po polsku"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excerpt_pl">Résumé (PL)</Label>
                    <Textarea
                      id="excerpt_pl"
                      value={formData.excerpt_pl}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt_pl: e.target.value }))}
                      placeholder="Krótki opis po polsku..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contenu (PL)</Label>
                    <RichTextEditor
                      content={formData.content_pl}
                      onChange={(content) => setFormData(prev => ({ ...prev, content_pl: content }))}
                      placeholder="Tresc artykulu po polsku..."
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
                    ★ Mettre à la une
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
                  <TableCell className="font-medium">{article.title_fr || article.slug}</TableCell>
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
                      <Badge variant="outline" className="border-primary text-primary">★</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(article.createdAt)}</TableCell>
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
