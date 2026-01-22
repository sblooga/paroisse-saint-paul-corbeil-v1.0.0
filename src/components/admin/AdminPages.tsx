import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
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

interface Page {
  id: string;
  slug: string;
  title_fr: string | null;
  title_pl: string | null;
  content_fr: string | null;
  content_pl: string | null;
  meta_title_fr: string | null;
  meta_title_pl: string | null;
  meta_description_fr: string | null;
  meta_description_pl: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminPages = () => {
  const { toast } = useToast();
  const { token } = useBackendAuth();
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:10000/api').replace(/\/$/, '');

  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [formData, setFormData] = useState({
    slug: '',
    title_fr: '',
    title_pl: '',
    content_fr: '',
    content_pl: '',
    meta_title_fr: '',
    meta_title_pl: '',
    meta_description_fr: '',
    meta_description_pl: '',
    published: true,
  });

  const headersAuth = (): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/pages/all`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Chargement impossible');
      const data = await res.json();
      setPages(data as Page[]);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les pages', variant: 'destructive' });
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
        slug: editingPage ? prev.slug : generateSlug(title),
        meta_title_fr: editingPage ? prev.meta_title_fr : title,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        title_pl: title,
        meta_title_pl: editingPage ? prev.meta_title_pl : title,
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
      meta_title_fr: '',
      meta_title_pl: '',
      meta_description_fr: '',
      meta_description_pl: '',
      published: true,
    });
    setEditingPage(null);
  };

  const openEditDialog = (page: Page) => {
    setEditingPage(page);
    setFormData({
      slug: page.slug,
      title_fr: page.title_fr || '',
      title_pl: page.title_pl || '',
      content_fr: page.content_fr || '',
      content_pl: page.content_pl || '',
      meta_title_fr: page.meta_title_fr || '',
      meta_title_pl: page.meta_title_pl || '',
      meta_description_fr: page.meta_description_fr || '',
      meta_description_pl: page.meta_description_pl || '',
      published: page.published,
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
      meta_title_fr: formData.meta_title_fr || null,
      meta_title_pl: formData.meta_title_pl || null,
      meta_description_fr: formData.meta_description_fr || null,
      meta_description_pl: formData.meta_description_pl || null,
      published: formData.published,
    };

    const method = editingPage ? 'PUT' : 'POST';
    const url = editingPage ? `${apiBase}/pages/${editingPage.id}` : `${apiBase}/pages`;

    try {
      const res = await fetch(url, {
        method,
        headers: headersAuth(),
        body: JSON.stringify(dataToSend),
      });
      if (!res.ok) throw new Error('Enregistrement impossible');
      toast({ title: editingPage ? 'Page mise à jour' : 'Page créée' });
      fetchPages();
      setDialogOpen(false);
      resetForm();
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message || 'Enregistrement impossible', variant: 'destructive' });
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${apiBase}/pages/${id}`, {
        method: 'PUT',
        headers: headersAuth(),
        body: JSON.stringify({ published: !currentStatus }),
      });
      if (res.ok) {
        setPages(prev => prev.map(p => p.id === id ? { ...p, published: !currentStatus } : p));
        toast({ title: currentStatus ? 'Page dépubliée' : 'Page publiée' });
      } else {
        throw new Error('Impossible de mettre à jour');
      }
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm('Supprimer cette page ?')) return;
    try {
      const res = await fetch(`${apiBase}/pages/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        setPages(prev => prev.filter(p => p.id !== id));
        toast({ title: 'Page supprimée' });
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
        <h2 className="text-lg font-heading font-semibold">Gestion des pages</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={18} />
              Nouvelle page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden w-[95vw]">
            <DialogHeader>
              <DialogTitle>
                {editingPage ? 'Modifier la page' : 'Nouvelle page'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-de-la-page"
                />
              </div>

              <Tabs defaultValue="fr" className="w-full">
                <TabsList className="w-full grid grid-cols-2 shrink-0">
                  <TabsTrigger value="fr" className="text-xs sm:text-sm">🇫🇷 FR</TabsTrigger>
                  <TabsTrigger value="pl" className="text-xs sm:text-sm">🇵🇱 PL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="fr" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title_fr">Titre (FR) *</Label>
                    <Input
                      id="title_fr"
                      value={formData.title_fr}
                      onChange={(e) => handleTitleChange(e.target.value, 'fr')}
                      placeholder="Titre de la page en français"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contenu (FR)</Label>
                    <RichTextEditor
                      content={formData.content_fr}
                      onChange={(content) => setFormData(prev => ({ ...prev, content_fr: content }))}
                      placeholder="Contenu de la page en français..."
                    />
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-medium mb-3">SEO (FR)</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="meta_title_fr">Meta Title</Label>
                        <Input
                          id="meta_title_fr"
                          value={formData.meta_title_fr}
                          onChange={(e) => setFormData(prev => ({ ...prev, meta_title_fr: e.target.value }))}
                          placeholder="Titre pour les moteurs de recherche"
                          maxLength={60}
                        />
                        <p className="text-xs text-muted-foreground">{formData.meta_title_fr.length}/60 caractères</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="meta_description_fr">Meta Description</Label>
                        <Textarea
                          id="meta_description_fr"
                          value={formData.meta_description_fr}
                          onChange={(e) => setFormData(prev => ({ ...prev, meta_description_fr: e.target.value }))}
                          placeholder="Description pour les moteurs de recherche"
                          rows={2}
                          maxLength={160}
                        />
                        <p className="text-xs text-muted-foreground">{formData.meta_description_fr.length}/160 caractères</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="pl" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title_pl">Titre (PL)</Label>
                    <Input
                      id="title_pl"
                      value={formData.title_pl}
                      onChange={(e) => handleTitleChange(e.target.value, 'pl')}
                      placeholder="Tytul strony po polsku"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contenu (PL)</Label>
                    <RichTextEditor
                      content={formData.content_pl}
                      onChange={(content) => setFormData(prev => ({ ...prev, content_pl: content }))}
                      placeholder="Tresc strony po polsku..."
                    />
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-medium mb-3">SEO (PL)</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="meta_title_pl">Meta Title</Label>
                        <Input
                          id="meta_title_pl"
                          value={formData.meta_title_pl}
                          onChange={(e) => setFormData(prev => ({ ...prev, meta_title_pl: e.target.value }))}
                          placeholder="Tytul dla wyszukiwarek"
                          maxLength={60}
                        />
                        <p className="text-xs text-muted-foreground">{formData.meta_title_pl.length}/60 znaków</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="meta_description_pl">Meta Description</Label>
                        <Textarea
                          id="meta_description_pl"
                          value={formData.meta_description_pl}
                          onChange={(e) => setFormData(prev => ({ ...prev, meta_description_pl: e.target.value }))}
                          placeholder="Opis dla wyszukiwarek"
                          rows={2}
                          maxLength={160}
                        />
                        <p className="text-xs text-muted-foreground">{formData.meta_description_pl.length}/160 znaków</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center gap-2">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                />
                <Label htmlFor="published">Publier</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  <X size={16} />
                  Annuler
                </Button>
                <Button type="submit">
                  <Save size={16} />
                  {editingPage ? 'Mettre à jour' : 'Créer'}
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
              <TableHead>Slug</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Modifié</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Aucune page
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title_fr || page.slug}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {page.title_fr && <Badge variant="outline">FR</Badge>}
                      {page.title_pl && <Badge variant="outline">PL</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">/{page.slug}</TableCell>
                  <TableCell>
                    {page.published ? (
                      <Badge variant="default" className="bg-green-600">Publiée</Badge>
                    ) : (
                      <Badge variant="secondary">Brouillon</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(page.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => togglePublished(page.id, page.published)}>
                        {page.published ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(page)}>
                        <Edit size={14} />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deletePage(page.id)}>
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

export default AdminPages;
