import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Homily {
  id: string;
  slug: string;
  title: string;
  cloudinaryPublicId: string;
  createdAt: string;
  updatedAt: string;
}

const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:10000/api').replace(/\/$/, '');
const authStorageKey = 'backend_jwt';

const AdminHomilies = () => {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(authStorageKey));
  const [homilies, setHomilies] = useState<Homily[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Homily | null>(null);
  const [form, setForm] = useState({ slug: '', title: '', cloudinaryPublicId: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const setAndPersistToken = (val: string | null) => {
    if (val) localStorage.setItem(authStorageKey, val);
    else localStorage.removeItem(authStorageKey);
    setToken(val);
  };

  const handleLogin = async () => {
    setAuthError(null);
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password })
      });
      if (!res.ok) {
        setAuthError('Identifiants invalides ou API indisponible');
        return;
      }
      const data = await res.json();
      setAndPersistToken(data.token);
      toast({ title: 'Connecté au backend', description: loginForm.email });
      fetchHomilies(data.token);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const authorizedFetch = async (url: string, options: RequestInit = {}) => {
    if (!token) throw new Error('Token manquant');
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {})
      }
    });
    if (res.status === 401 || res.status === 403) {
      setAndPersistToken(null);
      throw new Error('Session expirée ou non autorisée');
    }
    return res;
  };

  const fetchHomilies = async (tkn = token) => {
    if (!tkn) return;
    setLoading(true);
    try {
      const res = await authorizedFetch(`${apiBase}/homilies`);
      if (!res.ok) throw new Error('Erreur de chargement');
      const data = await res.json();
      setHomilies(data);
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchHomilies();
    }
  }, [token]);

  const openCreate = () => {
    setEditing(null);
    setForm({ slug: '', title: '', cloudinaryPublicId: '' });
    setDialogOpen(true);
  };

  const openEdit = (h: Homily) => {
    setEditing(h);
    setForm({
      slug: h.slug,
      title: h.title,
      cloudinaryPublicId: h.cloudinaryPublicId,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!token) return;
    if (!form.slug || !form.title || !form.cloudinaryPublicId) {
      toast({ title: 'Champs requis', description: 'Slug, titre et Cloudinary ID', variant: 'destructive' });
      return;
    }
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `${apiBase}/homilies/${editing.id}` : `${apiBase}/homilies`;
      const res = await authorizedFetch(url, { method, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Enregistrement impossible');
      setDialogOpen(false);
      fetchHomilies();
      toast({ title: editing ? 'Mis à jour' : 'Créé', description: form.title });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Supprimer cette homélie ?')) return;
    try {
      const res = await authorizedFetch(`${apiBase}/homilies/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Suppression impossible');
      fetchHomilies();
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  const handleUploadAudio = async () => {
    if (!token) {
      toast({ title: 'Erreur', description: 'Token manquant', variant: 'destructive' });
      return;
    }
    if (!audioFile) {
      toast({ title: 'Fichier requis', description: 'Choisissez un audio (MP3)', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', audioFile);
      const res = await fetch(`${apiBase}/uploads/audio`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      if (!res.ok) throw new Error('Upload impossible');
      const data = await res.json();
      setForm((prev) => ({ ...prev, cloudinaryPublicId: data.publicId }));
      toast({ title: 'Audio envoyé', description: `publicId: ${data.publicId}` });
    } catch (err: any) {
      toast({ title: 'Erreur upload', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Connexion backend (JWT)</h2>
        <div className="space-y-3 max-w-md">
          <div>
            <Label>Email</Label>
            <Input value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
          </div>
          <div>
            <Label>Mot de passe</Label>
            <Input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
          </div>
          {authError && <p className="text-sm text-destructive">{authError}</p>}
          <Button onClick={handleLogin}>Se connecter</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Homélies</h2>
          <p className="text-sm text-muted-foreground">Gestion des homélies (slug + Cloudinary public ID)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setAndPersistToken(null); setHomilies([]); }}>Se déconnecter</Button>
          <Button onClick={openCreate}>Ajouter</Button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Cloudinary</TableHead>
              <TableHead>Créée</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {homilies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">Aucune homélie</TableCell>
              </TableRow>
            ) : homilies.map((h) => (
              <TableRow key={h.id}>
                <TableCell className="font-medium">{h.title}</TableCell>
                <TableCell><Badge variant="outline">{h.slug}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{h.cloudinaryPublicId}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(h.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(h)}>Éditer</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(h.id)}>Supprimer</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier une homélie' : 'Créer une homélie'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div>
              <Label>Titre</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Cloudinary public ID</Label>
              <Textarea
                value={form.cloudinaryPublicId}
                onChange={(e) => setForm({ ...form, cloudinaryPublicId: e.target.value })}
                placeholder="ex: paroisse/homilies/homelie-2026-01-25"
              />
            </div>
            <div className="space-y-2 border rounded-md p-3">
              <div className="flex items-center gap-2">
                <Upload size={16} />
                <span>Uploader un fichier audio (MP3)</span>
              </div>
              <Input
                type="file"
                accept="audio/mpeg,audio/mp3,audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              />
              <Button type="button" onClick={handleUploadAudio} disabled={uploading} variant="outline">
                {uploading ? 'Envoi...' : 'Envoyer vers Cloudinary'}
              </Button>
              <p className="text-xs text-muted-foreground">
                Après upload, le champ "Cloudinary public ID" est rempli automatiquement.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSave}>{editing ? 'Mettre à jour' : 'Créer'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHomilies;
