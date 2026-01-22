import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useBackendAuth } from '@/hooks/useBackendAuth';

interface LifeStage {
  id: string;
  title_fr: string;
  title_pl: string | null;
  description_fr: string;
  description_pl: string | null;
  icon: string | null;
  imageUrl: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
}

const ICON_OPTIONS = [
  { value: 'Droplets', label: 'Baptême' },
  { value: 'BookOpen', label: 'Communion' },
  { value: 'Flame', label: 'Confirmation' },
  { value: 'Heart', label: 'Réconciliation' },
  { value: 'Gem', label: 'Mariage' },
  { value: 'Church', label: 'Vocation' },
  { value: 'Hand', label: 'Onction' },
  { value: 'Candle', label: 'Obsèques' },
  { value: 'Star', label: 'Autre' },
  { value: 'Cross', label: 'Croix' },
];

const AdminLifeStages = () => {
  const { toast } = useToast();
  const { token } = useBackendAuth();
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:10000/api').replace(/\/$/, '');

  const [stages, setStages] = useState<LifeStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<LifeStage | null>(null);
  const [formData, setFormData] = useState({
    title_fr: '',
    title_pl: '',
    description_fr: '',
    description_pl: '',
    icon: 'Heart',
    imageUrl: '',
    sortOrder: 0,
    active: true,
  });

  const headersAuth = (): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  };

  useEffect(() => {
    fetchStages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/life-stages/all`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Chargement impossible');
      const data = await res.json();
      setStages(data || []);
    } catch (error) {
      console.error('Error fetching life stages:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les étapes', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title_fr: '',
      title_pl: '',
      description_fr: '',
      description_pl: '',
      icon: 'Heart',
      imageUrl: '',
      sortOrder: stages.length,
      active: true,
    });
    setEditingStage(null);
  };

  const openEditDialog = (stage: LifeStage) => {
    setEditingStage(stage);
    setFormData({
      title_fr: stage.title_fr || '',
      title_pl: stage.title_pl || '',
      description_fr: stage.description_fr || '',
      description_pl: stage.description_pl || '',
      icon: stage.icon || 'Heart',
      imageUrl: stage.imageUrl || '',
      sortOrder: stage.sortOrder ?? 0,
      active: stage.active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title_fr || !formData.description_fr) {
      toast({ title: 'Erreur', description: 'Titre et description FR requis', variant: 'destructive' });
      return;
    }

    const dataToSend = {
      title_fr: formData.title_fr,
      title_pl: formData.title_pl || null,
      description_fr: formData.description_fr,
      description_pl: formData.description_pl || null,
      icon: formData.icon || null,
      imageUrl: formData.imageUrl || null,
      sortOrder: formData.sortOrder ?? 0,
      active: formData.active,
    };

    const method = editingStage ? 'PUT' : 'POST';
    const url = editingStage ? `${apiBase}/life-stages/${editingStage.id}` : `${apiBase}/life-stages`;

    try {
      const res = await fetch(url, {
        method,
        headers: headersAuth(),
        body: JSON.stringify(dataToSend),
      });
      if (!res.ok) throw new Error('Enregistrement impossible');
      toast({ title: editingStage ? 'Étape mise à jour' : 'Étape créée' });
      fetchStages();
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${apiBase}/life-stages/${id}`, {
        method: 'PUT',
        headers: headersAuth(),
        body: JSON.stringify({ active: !currentStatus }),
      });
      if (!res.ok) throw new Error();
      setStages(prev => prev.map(s => s.id === id ? { ...s, active: !currentStatus } : s));
      toast({ title: currentStatus ? 'Étape désactivée' : 'Étape activée' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour', variant: 'destructive' });
    }
  };

  const deleteStage = async (id: string) => {
    if (!confirm('Supprimer cette étape de vie ?')) return;
    
    try {
      const res = await fetch(`${apiBase}/life-stages/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error();
      setStages(prev => prev.filter(s => s.id !== id));
      toast({ title: 'Étape supprimée' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de supprimer', variant: 'destructive' });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-heading font-semibold">Gestion des étapes de vie</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={18} />
              Nouvelle étape
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingStage ? 'Modifier l\'étape' : 'Nouvelle étape de vie'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icône</Label>
                  <Select value={formData.icon} onValueChange={(v) => setFormData(prev => ({ ...prev, icon: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ordre d'affichage</Label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Image</Label>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                  folder="life-stages"
                />
              </div>

              <Tabs defaultValue="fr" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
                  <TabsTrigger value="pl">🇵🇱 Polski</TabsTrigger>
                </TabsList>
                
                <TabsContent value="fr" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Titre (FR) *</Label>
                    <Input
                      value={formData.title_fr}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_fr: e.target.value }))}
                      placeholder="Ex: Je veux baptiser mon enfant"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (FR) *</Label>
                    <Textarea
                      value={formData.description_fr}
                      onChange={(e) => setFormData(prev => ({ ...prev, description_fr: e.target.value }))}
                      placeholder="Description détaillée..."
                      rows={5}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="pl" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Titre (PL)</Label>
                    <Input
                      value={formData.title_pl}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_pl: e.target.value }))}
                      placeholder="Ex: Chce ochrzcić moje dziecko"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (PL)</Label>
                    <Textarea
                      value={formData.description_pl}
                      onChange={(e) => setFormData(prev => ({ ...prev, description_pl: e.target.value }))}
                      placeholder="Szczegółowy opis..."
                      rows={5}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                />
                <Label>Active</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  <X size={16} />
                  Annuler
                </Button>
                <Button type="submit">
                  <Save size={16} />
                  {editingStage ? 'Mettre à jour' : 'Créer'}
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
              <TableHead>Image</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Traductions</TableHead>
              <TableHead>Ordre</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Aucune étape de vie. Créez-en une pour commencer.
                </TableCell>
              </TableRow>
            ) : (
              stages.map((stage) => (
                <TableRow key={stage.id}>
                  <TableCell>
                    {stage.imageUrl ? (
                      <img src={stage.imageUrl} alt={stage.title_fr} className="w-16 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-12 bg-muted rounded flex items-center justify-center text-lg">
                        {ICON_OPTIONS.find(o => o.value === stage.icon)?.label ?? '—'}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium max-w-xs truncate">{stage.title_fr}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {stage.title_fr && <Badge variant="outline">FR</Badge>}
                      {stage.title_pl && <Badge variant="outline">PL</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{stage.sortOrder}</TableCell>
                  <TableCell>
                    <Badge variant={stage.active ? 'default' : 'secondary'}>
                      {stage.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleActive(stage.id, stage.active)}>
                        {stage.active ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(stage)}>
                        <Edit size={14} />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteStage(stage.id)}>
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

export default AdminLifeStages;
