import { useState, useEffect } from 'react';
import { Eye, Trash2, Download, Check, X, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  newsletter_optin: boolean;
  read: boolean;
  created_at: string;
}

const AdminMessages = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setMessages(data);
    if (error) console.error('Error fetching messages:', error);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('contact_messages')
      .update({ read: true })
      .eq('id', id);

    if (!error) {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
      toast({ title: 'Message marqué comme lu' });
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = messages.filter(m => !m.read).map(m => m.id);
    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from('contact_messages')
      .update({ read: true })
      .in('id', unreadIds);

    if (!error) {
      setMessages(prev => prev.map(m => ({ ...m, read: true })));
      toast({ title: 'Tous les messages marqués comme lus' });
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Supprimer ce message ?')) return;

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (!error) {
      setMessages(prev => prev.filter(m => m.id !== id));
      setSelectedMessage(null);
      toast({ title: 'Message supprimé' });
    } else {
      toast({ title: 'Erreur', description: 'Impossible de supprimer', variant: 'destructive' });
    }
  };

  const viewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    if (!message.read) {
      await markAsRead(message.id);
    }
  };

  const exportMessages = () => {
    const csvContent = [
      ['Date', 'Nom', 'Email', 'Sujet', 'Message', 'Newsletter', 'Lu'].join(';'),
      ...messages.map(m => [
        formatDate(m.created_at),
        `"${m.name}"`,
        m.email,
        `"${m.subject}"`,
        `"${m.message.replace(/"/g, '""')}"`,
        m.newsletter_optin ? 'Oui' : 'Non',
        m.read ? 'Oui' : 'Non',
      ].join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `messages_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: 'Export terminé' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-heading font-semibold">Messages de contact</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">{unreadCount} non lu(s)</p>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check size={16} />
              Tout marquer lu
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={exportMessages} disabled={messages.length === 0}>
            <Download size={16} />
            Exporter CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Chargement...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Statut</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Sujet</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Newsletter</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Aucun message reçu
                </TableCell>
              </TableRow>
            ) : (
              messages.map((msg) => (
                <TableRow key={msg.id} className={!msg.read ? 'bg-primary/5' : ''}>
                  <TableCell>
                    {msg.read ? (
                      <Badge variant="secondary">Lu</Badge>
                    ) : (
                      <Badge variant="default">Nouveau</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{msg.name}</TableCell>
                  <TableCell>{msg.email}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{msg.subject}</TableCell>
                  <TableCell className="text-sm">{formatDate(msg.created_at)}</TableCell>
                  <TableCell>
                    {msg.newsletter_optin ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <X size={18} className="text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => viewMessage(msg)}>
                        <Eye size={14} />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteMessage(msg.id)}>
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

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message de {selectedMessage?.name}</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{selectedMessage.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-medium">{formatDate(selectedMessage.created_at)}</p>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Sujet:</span>
                <p className="font-semibold text-lg">{selectedMessage.subject}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Message:</span>
                <div className="mt-2 p-4 bg-muted rounded-lg whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>
              {selectedMessage.newsletter_optin && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Mail size={16} />
                  Souhaite s'inscrire à la newsletter
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                >
                  <Mail size={16} />
                  Répondre
                </Button>
                <Button variant="destructive" onClick={() => deleteMessage(selectedMessage.id)}>
                  <Trash2 size={16} />
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMessages;
