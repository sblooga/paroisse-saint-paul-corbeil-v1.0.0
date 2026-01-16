import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MassSchedule {
  id: string;
  day_of_week: string;
  day_of_week_fr: string | null;
  day_of_week_pl: string | null;
  time: string;
  location: string | null;
  location_fr: string | null;
  location_pl: string | null;
  description: string | null;
  description_fr: string | null;
  description_pl: string | null;
  is_special: boolean;
  special_date: string | null;
  active: boolean;
  sort_order: number;
  language: string | null;
}

const DAYS = [
  { value: 'lundi', label: 'Lundi' },
  { value: 'mardi', label: 'Mardi' },
  { value: 'mercredi', label: 'Mercredi' },
  { value: 'jeudi', label: 'Jeudi' },
  { value: 'vendredi', label: 'Vendredi' },
  { value: 'samedi', label: 'Samedi' },
  { value: 'dimanche', label: 'Dimanche' },
];

const AdminMassSchedules = () => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<MassSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<MassSchedule | null>(null);
  const [formData, setFormData] = useState({
    day_of_week: 'dimanche',
    day_of_week_fr: '',
    day_of_week_pl: '',
    time: '',
    location: '',
    location_fr: '',
    location_pl: '',
    description: '',
    description_fr: '',
    description_pl: '',
    is_special: false,
    special_date: '',
    active: true,
    sort_order: 0,
    language: 'fr',
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('mass_schedules')
      .select('*')
      .order('sort_order')
      .order('day_of_week');
    
    if (data) setSchedules(data);
    if (error) console.error('Error fetching schedules:', error);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      day_of_week: 'dimanche',
      day_of_week_fr: '',
      day_of_week_pl: '',
      time: '',
      location: '',
      location_fr: '',
      location_pl: '',
      description: '',
      description_fr: '',
      description_pl: '',
      is_special: false,
      special_date: '',
      active: true,
      sort_order: 0,
      language: 'fr',
    });
    setEditingSchedule(null);
  };

  const openEditDialog = (schedule: MassSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      day_of_week: schedule.day_of_week,
      day_of_week_fr: schedule.day_of_week_fr || '',
      day_of_week_pl: schedule.day_of_week_pl || '',
      time: schedule.time,
      location: schedule.location || '',
      location_fr: schedule.location_fr || '',
      location_pl: schedule.location_pl || '',
      description: schedule.description || '',
      description_fr: schedule.description_fr || '',
      description_pl: schedule.description_pl || '',
      is_special: schedule.is_special,
      special_date: schedule.special_date || '',
      active: schedule.active,
      sort_order: schedule.sort_order,
      language: schedule.language || 'fr',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.day_of_week || !formData.time) {
      toast({ title: 'Erreur', description: 'Jour et heure requis', variant: 'destructive' });
      return;
    }

    const dataToSend = {
      day_of_week: formData.day_of_week,
      day_of_week_fr: formData.day_of_week_fr || null,
      day_of_week_pl: formData.day_of_week_pl || null,
      time: formData.time,
      location: formData.location || null,
      location_fr: formData.location_fr || null,
      location_pl: formData.location_pl || null,
      description: formData.description || null,
      description_fr: formData.description_fr || null,
      description_pl: formData.description_pl || null,
      is_special: formData.is_special,
      special_date: formData.special_date || null,
      active: formData.active,
      sort_order: formData.sort_order,
      language: formData.language,
    };

    if (editingSchedule) {
      const { error } = await supabase
        .from('mass_schedules')
        .update(dataToSend)
        .eq('id', editingSchedule.id);
      
      if (error) {
        toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Horaire mis à jour' });
        fetchSchedules();
        setDialogOpen(false);
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('mass_schedules')
        .insert([dataToSend]);
      
      if (error) {
        toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Horaire ajouté' });
        fetchSchedules();
        setDialogOpen(false);
        resetForm();
      }
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('mass_schedules')
      .update({ active: !currentStatus })
      .eq('id', id);
    
    if (!error) {
      setSchedules(prev => prev.map(s => s.id === id ? { ...s, active: !currentStatus } : s));
      toast({ title: currentStatus ? 'Horaire désactivé' : 'Horaire activé' });
    }
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm('Supprimer cet horaire ?')) return;
    
    const { error } = await supabase
      .from('mass_schedules')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setSchedules(prev => prev.filter(s => s.id !== id));
      toast({ title: 'Horaire supprimé' });
    } else {
      toast({ title: 'Erreur', description: 'Impossible de supprimer', variant: 'destructive' });
    }
  };

  const getDayLabel = (value: string) => {
    return DAYS.find(d => d.value === value)?.label || value;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-heading font-semibold">Horaires des messes</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={18} />
              Nouvel horaire
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? 'Modifier l\'horaire' : 'Nouvel horaire'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="day_of_week">Jour (clé système) *</Label>
                  <Select
                    value={formData.day_of_week}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, day_of_week: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Heure *</Label>
                  <Input
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    placeholder="10h30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Langue de la messe *</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">🇫🇷 Français</SelectItem>
                      <SelectItem value="pl">🇵🇱 Polski</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs defaultValue="fr" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
                  <TabsTrigger value="pl">🇵🇱 Polski</TabsTrigger>
                </TabsList>
                
                <TabsContent value="fr" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="day_of_week_fr">Jour (affiché FR)</Label>
                    <Input
                      id="day_of_week_fr"
                      value={formData.day_of_week_fr}
                      onChange={(e) => setFormData(prev => ({ ...prev, day_of_week_fr: e.target.value }))}
                      placeholder="Dimanche, En semaine..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location_fr">Lieu (FR)</Label>
                    <Input
                      id="location_fr"
                      value={formData.location_fr}
                      onChange={(e) => setFormData(prev => ({ ...prev, location_fr: e.target.value }))}
                      placeholder="Église principale..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description_fr">Description (FR)</Label>
                    <Textarea
                      id="description_fr"
                      value={formData.description_fr}
                      onChange={(e) => setFormData(prev => ({ ...prev, description_fr: e.target.value }))}
                      placeholder="Messe en français..."
                      rows={2}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="pl" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="day_of_week_pl">Jour (affiché PL)</Label>
                    <Input
                      id="day_of_week_pl"
                      value={formData.day_of_week_pl}
                      onChange={(e) => setFormData(prev => ({ ...prev, day_of_week_pl: e.target.value }))}
                      placeholder="Niedziela, W tygodniu..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location_pl">Lieu (PL)</Label>
                    <Input
                      id="location_pl"
                      value={formData.location_pl}
                      onChange={(e) => setFormData(prev => ({ ...prev, location_pl: e.target.value }))}
                      placeholder="Kościół główny..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description_pl">Description (PL)</Label>
                    <Textarea
                      id="description_pl"
                      value={formData.description_pl}
                      onChange={(e) => setFormData(prev => ({ ...prev, description_pl: e.target.value }))}
                      placeholder="Msza po polsku..."
                      rows={2}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Ordre</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="special_date">Date spéciale</Label>
                  <Input
                    id="special_date"
                    type="date"
                    value={formData.special_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, special_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_special"
                    checked={formData.is_special}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_special: checked }))}
                  />
                  <Label htmlFor="is_special">Messe spéciale</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                  />
                  <Label htmlFor="active">Actif</Label>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  <X size={16} />
                  Annuler
                </Button>
                <Button type="submit">
                  <Save size={16} />
                  {editingSchedule ? 'Mettre à jour' : 'Ajouter'}
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
              <TableHead>Jour</TableHead>
              <TableHead>Heure</TableHead>
              <TableHead>Langue</TableHead>
              <TableHead>Lieu (FR)</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Aucun horaire
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">
                    {schedule.day_of_week_fr || getDayLabel(schedule.day_of_week)}
                  </TableCell>
                  <TableCell>{schedule.time}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={schedule.language === 'pl' ? 'border-red-500 text-red-600' : 'border-blue-500 text-blue-600'}>
                      {schedule.language === 'pl' ? '🇵🇱 PL' : '🇫🇷 FR'}
                    </Badge>
                  </TableCell>
                  <TableCell>{schedule.location_fr || schedule.location || '-'}</TableCell>
                  <TableCell>
                    {schedule.is_special ? (
                      <Badge variant="outline" className="border-amber-500 text-amber-600">Spéciale</Badge>
                    ) : (
                      <Badge variant="outline">Régulière</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {schedule.active ? (
                      <Badge variant="default" className="bg-green-600">Actif</Badge>
                    ) : (
                      <Badge variant="secondary">Inactif</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleActive(schedule.id, schedule.active)}>
                        {schedule.active ? 'Désactiver' : 'Activer'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(schedule)}>
                        <Edit size={14} />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteSchedule(schedule.id)}>
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

export default AdminMassSchedules;