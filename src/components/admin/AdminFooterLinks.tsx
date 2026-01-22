import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, GripVertical, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useBackendAuth } from '@/hooks/useBackendAuth';

interface FooterLink {
  id: string;
  label: string;
  label_fr: string | null;
  label_pl: string | null;
  url: string;
  sortOrder: number | null;
  active: boolean | null;
}

const AdminFooterLinks = () => {
  const { t } = useTranslation();
  const { token } = useBackendAuth();
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:10000/api').replace(/\/$/, '');

  const [links, setLinks] = useState<FooterLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    label_fr: '',
    label_pl: '',
    url: '',
    sortOrder: 0,
    active: true,
  });

  const headersAuth = (): Record<string, string> => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  };

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/footer/all`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Chargement impossible');
      const data = await res.json();
      setLinks(data || []);
    } catch (error) {
      toast.error(t('admin.errors.fetchFailed'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const resetForm = () => {
    setFormData({
      label: '',
      label_fr: '',
      label_pl: '',
      url: '',
      sortOrder: links.length,
      active: true,
    });
    setEditingLink(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (link: FooterLink) => {
    setEditingLink(link);
    setFormData({
      label: link.label,
      label_fr: link.label_fr || '',
      label_pl: link.label_pl || '',
      url: link.url,
      sortOrder: link.sortOrder || 0,
      active: link.active ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      label: formData.label,
      label_fr: formData.label_fr || null,
      label_pl: formData.label_pl || null,
      url: formData.url,
      sortOrder: formData.sortOrder ?? 0,
      active: formData.active,
    };

    const method = editingLink ? 'PUT' : 'POST';
    const url = editingLink ? `${apiBase}/footer/${editingLink.id}` : `${apiBase}/footer`;

    try {
      const res = await fetch(url, {
        method,
        headers: headersAuth(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Enregistrement impossible');
      toast.success(editingLink ? t('admin.success.updated') : t('admin.success.created'));
      fetchLinks();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error(t('admin.errors.updateFailed'));
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirmDelete'))) return;
    try {
      const res = await fetch(`${apiBase}/footer/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Suppression impossible');
      toast.success(t('admin.success.deleted'));
      fetchLinks();
    } catch (error) {
      toast.error(t('admin.errors.deleteFailed'));
    }
  };

  const toggleActive = async (link: FooterLink) => {
    try {
      const res = await fetch(`${apiBase}/footer/${link.id}`, {
        method: 'PUT',
        headers: headersAuth(),
        body: JSON.stringify({ active: !link.active }),
      });
      if (!res.ok) throw new Error();
      fetchLinks();
    } catch {
      toast.error(t('admin.errors.updateFailed'));
    }
  };

  if (loading) {
    return <div className="text-center py-8">{t('admin.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-heading font-bold">{t('admin.footerLinks.title')}</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus size={16} className="mr-2" />
              {t('admin.footerLinks.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingLink ? t('admin.footerLinks.edit') : t('admin.footerLinks.add')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">{t('admin.footerLinks.labelDefault')}</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label_fr">{t('admin.footerLinks.labelFr')}</Label>
                  <Input
                    id="label_fr"
                    value={formData.label_fr}
                    onChange={(e) => setFormData({ ...formData, label_fr: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label_pl">{t('admin.footerLinks.labelPl')}</Label>
                  <Input
                    id="label_pl"
                    value={formData.label_pl}
                    onChange={(e) => setFormData({ ...formData, label_pl: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">{t('admin.footerLinks.url')}</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="/page ou #section ou https://..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">{t('admin.footerLinks.sortOrder')}</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active">{t('admin.footerLinks.active')}</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t('admin.actions.cancel')}
                </Button>
                <Button type="submit">
                  {editingLink ? t('admin.actions.save') : t('admin.actions.create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {links.map((link) => (
          <Card key={link.id} className={!link.active ? 'opacity-50' : ''}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <GripVertical size={20} className="text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <LinkIcon size={16} className="text-primary" />
                    <span className="font-medium">{link.label_fr || link.label}</span>
                    <span className="text-xs text-muted-foreground">({link.sortOrder ?? 0})</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{link.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={link.active ?? true}
                  onCheckedChange={() => toggleActive(link)}
                />
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(link)}>
                  <Pencil size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(link.id)}>
                  <Trash2 size={16} className="text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {links.length === 0 && (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              {t('admin.footerLinks.empty')}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminFooterLinks;
