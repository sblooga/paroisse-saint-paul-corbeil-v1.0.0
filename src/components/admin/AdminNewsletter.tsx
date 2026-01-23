import { useState, useEffect } from 'react';
import { Download, UserX, UserCheck, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useBackendAuth } from '@/hooks/useBackendAuth';

interface NewsletterSubscriber {
  id: string;
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminNewsletter = () => {
  const { toast } = useToast();
  const { token } = useBackendAuth();
  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:10000/api').replace(/\/$/, '');

  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/newsletter`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Chargement impossible');
      const data = await res.json();
      setSubscribers(data);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les abonnés', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${apiBase}/newsletter/${id}`, {
        method: 'PATCH',
        headers: token ? { Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentStatus }),
      });
      if (!res.ok) throw new Error();
      setSubscribers(prev => prev.map(s => s.id === id ? { ...s, active: !currentStatus } : s));
      toast({ title: currentStatus ? 'Abonné désactivé' : 'Abonné réactivé' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour', variant: 'destructive' });
    }
  };

  const deleteSubscriber = async (id: string) => {
    if (!confirm('Supprimer cet abonné définitivement ?')) return;

    try {
      const res = await fetch(`${apiBase}/newsletter/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error();
      setSubscribers(prev => prev.filter(s => s.id !== id));
      toast({ title: 'Abonné supprimé' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de supprimer', variant: 'destructive' });
    }
  };

  const exportSubscribers = (activeOnly: boolean = false) => {
    const data = activeOnly ? subscribers.filter(s => s.active) : subscribers;
    
    const csvContent = [
      ['Email', 'Date inscription', 'Statut'].join(';'),
      ...data.map(s => [
        s.email,
        formatDate(s.createdAt || s.updatedAt),
        s.active ? 'Actif' : 'Inactif',
      ].join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter_${activeOnly ? 'actifs_' : ''}${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: `Export de ${data.length} abonné(s) terminé` });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const activeCount = subscribers.filter(s => s.active).length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-heading font-semibold">Abonnés newsletter</h2>
          <p className="text-sm text-muted-foreground">
            {activeCount} actif(s) sur {subscribers.length} total
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportSubscribers(true)} disabled={activeCount === 0}>
            <Download size={16} />
            Exporter actifs
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportSubscribers(false)} disabled={subscribers.length === 0}>
            <Download size={16} />
            Exporter tout
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Chargement...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Date d'inscription</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscribers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Aucun abonné à la newsletter
                </TableCell>
              </TableRow>
            ) : (
              subscribers.map((sub) => (
                <TableRow key={sub.id} className={!sub.active ? 'opacity-60' : ''}>
                  <TableCell className="font-medium">{sub.email}</TableCell>
                  <TableCell>{formatDate(sub.consent_date)}</TableCell>
                  <TableCell>
                    {sub.active ? (
                      <Badge variant="default" className="bg-green-600">Actif</Badge>
                    ) : (
                      <Badge variant="secondary">Inactif</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleStatus(sub.id, sub.active)}
                      >
                        {sub.active ? <UserX size={14} /> : <UserCheck size={14} />}
                        {sub.active ? 'Désactiver' : 'Réactiver'}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteSubscriber(sub.id)}>
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

export default AdminNewsletter;
