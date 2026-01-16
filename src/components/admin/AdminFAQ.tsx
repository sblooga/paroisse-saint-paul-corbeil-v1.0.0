import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface FAQCategory {
  id: string;
  title: string;
  title_fr: string | null;
  title_pl: string | null;
  icon: string;
  sort_order: number;
  active: boolean;
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
  active: boolean;
}

const ICON_OPTIONS = [
  { value: 'Church', label: '⛪ Église' },
  { value: 'Users', label: '👥 Utilisateurs' },
  { value: 'Info', label: 'ℹ️ Info' },
  { value: 'HelpCircle', label: '❓ Aide' },
  { value: 'Book', label: '📖 Livre' },
  { value: 'Calendar', label: '📅 Calendrier' },
  { value: 'Heart', label: '❤️ Cœur' },
  { value: 'Star', label: '⭐ Étoile' },
];

const AdminFAQ = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [items, setItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  // Category dialog
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FAQCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    title: '', title_fr: '', title_pl: '', icon: 'HelpCircle', sort_order: 0, active: true,
  });

  // Item dialog
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [itemForm, setItemForm] = useState({
    question: '', question_fr: '', question_pl: '',
    answer: '', answer_fr: '', answer_pl: '',
    sort_order: 0, active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [catRes, itemRes] = await Promise.all([
      supabase.from('faq_categories').select('*').order('sort_order'),
      supabase.from('faq_items').select('*').order('sort_order'),
    ]);
    if (catRes.data) setCategories(catRes.data);
    if (itemRes.data) setItems(itemRes.data);
    setLoading(false);
  };

  // Category handlers
  const resetCategoryForm = () => {
    setCategoryForm({ title: '', title_fr: '', title_pl: '', icon: 'HelpCircle', sort_order: 0, active: true });
    setEditingCategory(null);
  };

  const openEditCategoryDialog = (cat: FAQCategory) => {
    setEditingCategory(cat);
    setCategoryForm({
      title: cat.title,
      title_fr: cat.title_fr || '',
      title_pl: cat.title_pl || '',
      icon: cat.icon,
      sort_order: cat.sort_order,
      active: cat.active,
    });
    setCategoryDialogOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.title_fr) {
      toast({ title: 'Erreur', description: 'Titre FR requis', variant: 'destructive' });
      return;
    }

    const data = {
      title: categoryForm.title_fr,
      title_fr: categoryForm.title_fr,
      title_pl: categoryForm.title_pl || null,
      icon: categoryForm.icon,
      sort_order: categoryForm.sort_order,
      active: categoryForm.active,
    };

    if (editingCategory) {
      const { error } = await supabase.from('faq_categories').update(data).eq('id', editingCategory.id);
      if (error) toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      else { toast({ title: 'Catégorie mise à jour' }); fetchData(); setCategoryDialogOpen(false); resetCategoryForm(); }
    } else {
      const { error } = await supabase.from('faq_categories').insert([data]);
      if (error) toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      else { toast({ title: 'Catégorie créée' }); fetchData(); setCategoryDialogOpen(false); resetCategoryForm(); }
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Supprimer cette catégorie et toutes ses questions ?')) return;
    const { error } = await supabase.from('faq_categories').delete().eq('id', id);
    if (!error) { setCategories(prev => prev.filter(c => c.id !== id)); toast({ title: 'Catégorie supprimée' }); }
    else toast({ title: 'Erreur', description: 'Impossible de supprimer', variant: 'destructive' });
  };

  // Item handlers
  const resetItemForm = () => {
    setItemForm({ question: '', question_fr: '', question_pl: '', answer: '', answer_fr: '', answer_pl: '', sort_order: 0, active: true });
    setEditingItem(null);
    setSelectedCategoryId('');
  };

  const openAddItemDialog = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    resetItemForm();
    setItemDialogOpen(true);
  };

  const openEditItemDialog = (item: FAQItem) => {
    setEditingItem(item);
    setSelectedCategoryId(item.category_id);
    setItemForm({
      question: item.question,
      question_fr: item.question_fr || '',
      question_pl: item.question_pl || '',
      answer: item.answer,
      answer_fr: item.answer_fr || '',
      answer_pl: item.answer_pl || '',
      sort_order: item.sort_order,
      active: item.active,
    });
    setItemDialogOpen(true);
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.question_fr || !itemForm.answer_fr) {
      toast({ title: 'Erreur', description: 'Question et réponse FR requises', variant: 'destructive' });
      return;
    }

    const data = {
      category_id: selectedCategoryId,
      question: itemForm.question_fr,
      question_fr: itemForm.question_fr,
      question_pl: itemForm.question_pl || null,
      answer: itemForm.answer_fr,
      answer_fr: itemForm.answer_fr,
      answer_pl: itemForm.answer_pl || null,
      sort_order: itemForm.sort_order,
      active: itemForm.active,
    };

    if (editingItem) {
      const { error } = await supabase.from('faq_items').update(data).eq('id', editingItem.id);
      if (error) toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      else { toast({ title: 'Question mise à jour' }); fetchData(); setItemDialogOpen(false); resetItemForm(); }
    } else {
      const { error } = await supabase.from('faq_items').insert([data]);
      if (error) toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      else { toast({ title: 'Question créée' }); fetchData(); setItemDialogOpen(false); resetItemForm(); }
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Supprimer cette question ?')) return;
    const { error } = await supabase.from('faq_items').delete().eq('id', id);
    if (!error) { setItems(prev => prev.filter(i => i.id !== id)); toast({ title: 'Question supprimée' }); }
    else toast({ title: 'Erreur', description: 'Impossible de supprimer', variant: 'destructive' });
  };

  const toggleExpanded = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const getItemsForCategory = (categoryId: string) => items.filter(i => i.category_id === categoryId);

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
              <Tabs defaultValue="fr">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
                  <TabsTrigger value="pl">🇵🇱 Polski</TabsTrigger>
                </TabsList>
                <TabsContent value="fr" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Titre (FR) *</Label>
                    <Input value={categoryForm.title_fr} onChange={(e) => setCategoryForm(prev => ({ ...prev, title_fr: e.target.value }))} placeholder="Titre de la catégorie" />
                  </div>
                </TabsContent>
                <TabsContent value="pl" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Titre (PL)</Label>
                    <Input value={categoryForm.title_pl} onChange={(e) => setCategoryForm(prev => ({ ...prev, title_pl: e.target.value }))} placeholder="Tytuł kategorii" />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icône</Label>
                  <Select value={categoryForm.icon} onValueChange={(v) => setCategoryForm(prev => ({ ...prev, icon: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ordre</Label>
                  <Input type="number" value={categoryForm.sort_order} onChange={(e) => setCategoryForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch checked={categoryForm.active} onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, active: checked }))} />
                <Label>Active</Label>
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
                  <Input value={itemForm.question_fr} onChange={(e) => setItemForm(prev => ({ ...prev, question_fr: e.target.value }))} placeholder="La question..." />
                </div>
                <div className="space-y-2">
                  <Label>Réponse (FR) *</Label>
                  <Textarea value={itemForm.answer_fr} onChange={(e) => setItemForm(prev => ({ ...prev, answer_fr: e.target.value }))} placeholder="La réponse..." rows={4} />
                </div>
              </TabsContent>
              <TabsContent value="pl" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Question (PL)</Label>
                  <Input value={itemForm.question_pl} onChange={(e) => setItemForm(prev => ({ ...prev, question_pl: e.target.value }))} placeholder="Pytanie..." />
                </div>
                <div className="space-y-2">
                  <Label>Réponse (PL)</Label>
                  <Textarea value={itemForm.answer_pl} onChange={(e) => setItemForm(prev => ({ ...prev, answer_pl: e.target.value }))} placeholder="Odpowiedź..." rows={4} />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ordre</Label>
                <Input type="number" value={itemForm.sort_order} onChange={(e) => setItemForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="flex items-center gap-2 pt-7">
                <Switch checked={itemForm.active} onCheckedChange={(checked) => setItemForm(prev => ({ ...prev, active: checked }))} />
                <Label>Active</Label>
              </div>
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
                    <span className="text-lg">{ICON_OPTIONS.find(o => o.value === cat.icon)?.label.split(' ')[0] || '❓'}</span>
                    <span className="font-semibold text-foreground">{cat.title_fr || cat.title}</span>
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
                            <TableCell className="font-medium max-w-md truncate">{item.question_fr || item.question}</TableCell>
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
