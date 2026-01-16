import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  category: string;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  name_fr: string | null;
  name_pl: string | null;
  role_fr: string | null;
  role_pl: string | null;
  bio_fr: string | null;
  bio_pl: string | null;
  sort_order: number;
  active: boolean;
  community: string | null;
  created_at: string;
}

const CATEGORIES = [
  { value: 'priests', label: 'Prêtres' },
  { value: 'team', label: 'Équipe animatrice' },
  { value: 'services', label: 'Services' },
  { value: 'secretariat', label: 'Secrétariat' },
  { value: 'choir', label: 'Chorale' },
];

const AdminTeam = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    category: 'team',
    photo_url: '',
    email: '',
    phone: '',
    bio: '',
    name_fr: '',
    name_pl: '',
    role_fr: '',
    role_pl: '',
    bio_fr: '',
    bio_pl: '',
    sort_order: 0,
    active: true,
    community: 'fr',
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('category')
      .order('sort_order');
    
    if (data) setMembers(data as TeamMember[]);
    if (error) console.error('Error fetching team members:', error);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      category: 'team',
      photo_url: '',
      email: '',
      phone: '',
      bio: '',
      name_fr: '',
      name_pl: '',
      role_fr: '',
      role_pl: '',
      bio_fr: '',
      bio_pl: '',
      sort_order: 0,
      active: true,
      community: 'fr',
    });
    setEditingMember(null);
  };

  const openEditDialog = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      category: member.category,
      photo_url: member.photo_url || '',
      email: member.email || '',
      phone: member.phone || '',
      bio: member.bio || '',
      name_fr: member.name_fr || member.name || '',
      name_pl: member.name_pl || '',
      role_fr: member.role_fr || member.role || '',
      role_pl: member.role_pl || '',
      bio_fr: member.bio_fr || member.bio || '',
      bio_pl: member.bio_pl || '',
      sort_order: member.sort_order,
      active: member.active,
      community: member.community || 'fr',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name_fr || !formData.role_fr || !formData.category) {
      toast({ title: 'Erreur', description: 'Nom (FR), fonction (FR) et catégorie requis', variant: 'destructive' });
      return;
    }

    const dataToSend = {
      name: formData.name_fr,
      role: formData.role_fr,
      category: formData.category,
      photo_url: formData.photo_url || null,
      email: formData.email || null,
      phone: formData.phone || null,
      bio: formData.bio_fr || null,
      name_fr: formData.name_fr,
      name_pl: formData.name_pl || null,
      role_fr: formData.role_fr,
      role_pl: formData.role_pl || null,
      bio_fr: formData.bio_fr || null,
      bio_pl: formData.bio_pl || null,
      sort_order: formData.sort_order,
      active: formData.active,
      community: formData.community,
    };

    if (editingMember) {
      const { error } = await supabase
        .from('team_members')
        .update(dataToSend)
        .eq('id', editingMember.id);
      
      if (error) {
        toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Membre mis à jour' });
        fetchMembers();
        setDialogOpen(false);
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('team_members')
        .insert([dataToSend]);
      
      if (error) {
        toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Membre ajouté' });
        fetchMembers();
        setDialogOpen(false);
        resetForm();
      }
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('team_members')
      .update({ active: !currentStatus })
      .eq('id', id);
    
    if (!error) {
      setMembers(prev => prev.map(m => m.id === id ? { ...m, active: !currentStatus } : m));
      toast({ title: currentStatus ? 'Membre désactivé' : 'Membre activé' });
    }
  };

  const deleteMember = async (id: string) => {
    if (!confirm('Supprimer ce membre ?')) return;
    
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setMembers(prev => prev.filter(m => m.id !== id));
      toast({ title: 'Membre supprimé' });
    } else {
      toast({ title: 'Erreur', description: 'Impossible de supprimer', variant: 'destructive' });
    }
  };

  const getCategoryLabel = (value: string) => {
    return CATEGORIES.find(c => c.value === value)?.label || value;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-heading font-semibold">Gestion de l'équipe</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={18} />
              Nouveau membre
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? 'Modifier le membre' : 'Nouveau membre'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="community">Communauté *</Label>
                  <Select
                    value={formData.community}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, community: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">🇫🇷 Française</SelectItem>
                      <SelectItem value="pl">🇵🇱 Polonaise</SelectItem>
                      <SelectItem value="both">🇫🇷🇵🇱 Les deux</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Ordre d'affichage</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Photo</Label>
                <ImageUpload
                  value={formData.photo_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, photo_url: url }))}
                  folder="team"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemple.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+33..."
                  />
                </div>
              </div>

              <Tabs defaultValue="fr" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
                  <TabsTrigger value="pl">🇵🇱 Polski</TabsTrigger>
                </TabsList>
                
                <TabsContent value="fr" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name_fr">Nom (FR) *</Label>
                      <Input
                        id="name_fr"
                        value={formData.name_fr}
                        onChange={(e) => setFormData(prev => ({ ...prev, name_fr: e.target.value }))}
                        placeholder="Nom complet"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role_fr">Fonction (FR) *</Label>
                      <Input
                        id="role_fr"
                        value={formData.role_fr}
                        onChange={(e) => setFormData(prev => ({ ...prev, role_fr: e.target.value }))}
                        placeholder="Ex: Curé, Secrétaire..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio_fr">Biographie (FR)</Label>
                    <Textarea
                      id="bio_fr"
                      value={formData.bio_fr}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio_fr: e.target.value }))}
                      placeholder="Courte présentation en français..."
                      rows={3}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="pl" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name_pl">Nom (PL)</Label>
                      <Input
                        id="name_pl"
                        value={formData.name_pl}
                        onChange={(e) => setFormData(prev => ({ ...prev, name_pl: e.target.value }))}
                        placeholder="Imię i nazwisko"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role_pl">Fonction (PL)</Label>
                      <Input
                        id="role_pl"
                        value={formData.role_pl}
                        onChange={(e) => setFormData(prev => ({ ...prev, role_pl: e.target.value }))}
                        placeholder="Np: Proboszcz, Sekretarz..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio_pl">Biographie (PL)</Label>
                    <Textarea
                      id="bio_pl"
                      value={formData.bio_pl}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio_pl: e.target.value }))}
                      placeholder="Krótka prezentacja po polsku..."
                      rows={3}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center gap-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                />
                <Label htmlFor="active">Membre actif</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  <X size={16} />
                  Annuler
                </Button>
                <Button type="submit">
                  <Save size={16} />
                  {editingMember ? 'Mettre à jour' : 'Ajouter'}
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
              <TableHead>Nom</TableHead>
              <TableHead>Traductions</TableHead>
              <TableHead>Fonction</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Communauté</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Aucun membre
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name_fr || member.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {member.name_fr && <Badge variant="outline">FR</Badge>}
                      {member.name_pl && <Badge variant="outline">PL</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{member.role_fr || member.role}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getCategoryLabel(member.category)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      member.community === 'pl' ? 'border-red-500 text-red-600' : 
                      member.community === 'both' ? 'border-purple-500 text-purple-600' : 
                      'border-blue-500 text-blue-600'
                    }>
                      {member.community === 'pl' ? '🇵🇱 PL' : member.community === 'both' ? '🇫🇷🇵🇱' : '🇫🇷 FR'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.active ? (
                      <Badge variant="default" className="bg-green-600">Actif</Badge>
                    ) : (
                      <Badge variant="secondary">Inactif</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleActive(member.id, member.active)}>
                        {member.active ? 'Désactiver' : 'Activer'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(member)}>
                        <Edit size={14} />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteMember(member.id)}>
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

export default AdminTeam;