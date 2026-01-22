import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useBackendAuth } from '@/hooks/useBackendAuth';

interface FaqItem {
  id: string;
  categoryId: string;
  question_fr: string;
  question_pl: string | null;
  answer_fr: string | null;
  answer_pl: string | null;
  sort_order: number;
  active: boolean;
}

interface FaqCategory {
  id: string;
  name: string;
  sort_order: number;
  active: boolean;
  items?: FaqItem[];
}

const AdminFAQ = () => {
  const { toast } = useToast();
  const { token } = useBackendAuth();
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:10000/api').replace(/\/$/, '');

  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Category dialog
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FaqCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', sort_order: 0, active: true });

  // Item dialog
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FaqItem | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [itemForm, setItemForm] = useState({
    question_fr: '',
    question_pl: '',
    answer_fr: '',
    answer_pl: '',
    sort_order: 0,
    active: true,
  });

  const headersAuth = (): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/faq/all`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Chargement impossible');
      const data = await res.json();
      setCategories(data as FaqCategory[]);
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger la FAQ', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Category handlers
  const resetCategoryForm = () => {
    setCategoryForm({ name: '', sort_order: 0, active: true });
    setEditingCategory(null);
  };

  const openEditCategoryDialog = (cat: FaqCategory) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      sort_order: cat.sort_order,
      active: cat.active,
    });
    setCategoryDialogOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name) {
      toast({ title: 'Erreur', description: 'Titre requis', variant: 'destructive' });
      return;
    }

    const method = editingCategory ? 'PUT' : 'POST';
    const url = editingCategory
      ? `${apiBase}/faq/categories/${editingCategory.id}`
      : `${apiBase}/faq/categories`;

    try {
      const res = await fetch(url, {
        method,
        headers: headersAuth(),
        body: JSON.stringify(categoryForm),
      });
      if (!res.ok) throw new Error('Enregistrement impossible');
      toast({ title: editingCategory ? 'Catégorie mise à jour' : 'Catégorie créée' });
      fetchData();
      setCategoryDialogOpen(false);
      resetCategoryForm();
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message || 'Enregistrement impossible', variant: 'destructive' });
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Supprimer cette catégorie et toutes ses questions ?')) return;
    try {
      const res = await fetch(`${apiBase}/faq/categories/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
        toast({ title: 'Catégorie supprimée' });
      } else {
        throw new Error('Impossible de supprimer');
      }
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  // Item handlers
  const resetItemForm = () => {
    setItemForm({ question_fr: '', question_pl: '', answer_fr: '', answer_pl: '', sort_order: 0, active: true });
    setEditingItem(null);
    setSelectedCategoryId('');
  };

  const openAddItemDialog = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    resetItemForm();
    setItemDialogOpen(true);
  };

  const openEditItemDialog = (item: FaqItem) => {
    setEditingItem(item);
    setSelectedCategoryId(item.categoryId);
    setItemForm({
      question_fr: item.question_fr,
      question_pl: item.question_pl || '',
      answer_fr: item.answer_fr || '',
      answer_pl: item.answer_pl || '',
      sort_order: item.sort_order,
      active: item.active,
    });
    setItemDialogOpen(true);
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.question_fr || !itemForm.answer_fr || !selectedCategoryId) {
      toast({ title: 'Erreur', description: 'Question, réponse et catégorie requis', variant: 'destructive' });
      return;
    }

    const data = {
      categoryId: selectedCategoryId,
      question_fr: itemForm.question_fr,
      question_pl: itemForm.question_pl || null,
      answer_fr: itemForm.answer_fr,
      answer_pl: itemForm.answer_pl || null,
      sort_order: itemForm.sort_order,
      active: itemForm.active,
    };

    const method = editingItem ? 'PUT' : 'POST';
    const url = editingItem
      ? `${apiBase}/faq/items/${editingItem.id}`
      : `${apiBase}/faq/items`;

    try {
      const res = await fetch(url, {
        method,
        headers: headersAuth(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Enregistrement impossible');
      toast({ title: editingItem ? 'Question mise à jour' : 'Question créée' });
      fetchData();
      setItemDialogOpen(false);
      resetItemForm();
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message || 'Enregistrement impossible', variant: 'destructive' });
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Supprimer cette question ?')) return;
    try {
      const res = await fetch(`${apiBase}/faq/items/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        setCategories(prev => prev.map(cat => ({
          ...cat,
          items: cat.items?.filter(i => i.id !== id) || []
        })));
        toast({ title: 'Question supprimée' });
        fetchData();
      } else {
        throw new Error('Impossible de supprimer');
      }
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const getItemsForCategory = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.items || [];
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-heading font-semibold">Gestion de la FAQ</h2>
        <Dialog open={categoryDialogOpen} onOpenChange={(open) => { setCategoryDialogOpen(open); if (!open) resetCategoryForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus size={18} /> Nouvelle catégorie</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Titre *</Label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Titre de la catégorie"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ordre</Label>
                  <Input
                    type="number"
                    value={categoryForm.sort_order}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex items-center gap-2 pt-7">
                  <Switch
                    checked={categoryForm.active}
                    onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, active: checked }))}
                  />
                  <Label>Active</Label>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}><X size={16} /> Annuler</Button>
                <Button type="submit"><Save size={16} /> {editingCategory ? 'Mettre à jour' : 'Créer'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={(open) => { setItemDialogOpen(open); if (!open) resetItemForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Modifier la question' : 'Nouvelle question'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleItemSubmit} className="space-y-4">
            <Tabs defaultValue="fr">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
                <TabsTrigger value="pl">🇵🇱 Polski</TabsTrigger>
              </TabsList>
              <TabsContent value="fr" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Question (FR) *</Label>
                  <Input
                    value={itemForm.question_fr}
                    onChange={(e) => setItemForm(prev => ({ ...prev, question_fr: e.target.value }))}
                    placeholder="La question..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Réponse (FR) *</Label>
                  <Textarea
                    value={itemForm.answer_fr}
                    onChange={(e) => setItemForm(prev => ({ ...prev, answer_fr: e.target.value }))}
                    placeholder="La réponse..."
                    rows={4}
                  />
                </div>
              </TabsContent>
              <TabsContent value="pl" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Question (PL)</Label>
                  <Input
                    value={itemForm.question_pl}
                    onChange={(e) => setItemForm(prev => ({ ...prev, question_pl: e.target.value }))}
                    placeholder="Pytanie..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Réponse (PL)</Label>
                  <Textarea
                    value={itemForm.answer_pl}
                    onChange={(e) => setItemForm(prev => ({ ...prev, answer_pl: e.target.value }))}
                    placeholder="Odpowiedź..."
                    rows={4}
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Catégorie *</Label>
                <Select
                  value={selectedCategoryId}
                  onValueChange={(value) => setSelectedCategoryId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ordre</Label>
                <Input
                  type="number"
                  value={itemForm.sort_order}
                  onChange={(e) => setItemForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch checked={itemForm.active} onCheckedChange={(checked) => setItemForm(prev => ({ ...prev, active: checked }))} />
              <Label>Active</Label>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setItemDialogOpen(false)}><X size={16} /> Annuler</Button>
              <Button type="submit"><Save size={16} /> {editingItem ? 'Mettre à jour' : 'Créer'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Chargement...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Aucune catégorie. Créez-en une pour commencer.</div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <Collapsible key={cat.id} open={expandedCategories.includes(cat.id)} onOpenChange={() => toggleExpanded(cat.id)}>
              <div className="card-parish p-4">
                <div className="flex items-center justify-between">
                  <CollapsibleTrigger className="flex items-center gap-3 flex-1 text-left">
                    <span className="font-semibold text-foreground">{cat.name}</span>
                    <Badge variant={cat.active ? 'default' : 'secondary'}>{cat.active ? 'Active' : 'Inactive'}</Badge>
                    <Badge variant="outline">{getItemsForCategory(cat.id).length} questions</Badge>
                    {expandedCategories.includes(cat.id) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </CollapsibleTrigger>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openAddItemDialog(cat.id)}><Plus size={14} /></Button>
                    <Button size="sm" variant="outline" onClick={() => openEditCategoryDialog(cat)}><Edit size={14} /></Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteCategory(cat.id)}><Trash2 size={14} /></Button>
                  </div>
                </div>
                
                <CollapsibleContent className="mt-4">
                  {getItemsForCategory(cat.id).length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 text-center">Aucune question dans cette catégorie</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Question</TableHead>
                          <TableHead>Traductions</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getItemsForCategory(cat.id).map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium max-w-md truncate">{item.question_fr}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {item.question_fr && <Badge variant="outline">FR</Badge>}
                                {item.question_pl && <Badge variant="outline">PL</Badge>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={item.active ? 'default' : 'secondary'}>{item.active ? 'Active' : 'Inactive'}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => openEditItemDialog(item)}><Edit size={14} /></Button>
                                <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}><Trash2 size={14} /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFAQ;
