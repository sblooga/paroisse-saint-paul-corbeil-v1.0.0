import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, User, Trash2, Plus, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UserWithRoles {
  id: string;
  email: string;
  created_at: string;
  roles: string[];
}

interface AdminUsersProps {
  refreshKey?: number;
}

export default function AdminUsers({ refreshKey }: AdminUsersProps) {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    fetchUsers();
  }, [refreshKey]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('list-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw response.error;
      }

      setUsers(response.data.users || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: t('admin.users.fetchError', 'Erreur'),
        description: error.message || t('admin.users.fetchErrorDesc', 'Impossible de charger les utilisateurs'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addRole = async (userId: string, role: 'admin' | 'editor') => {
    if (!role) return;
    
    setActionLoading(`add-${userId}`);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: role as 'admin' | 'editor' });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: t('admin.users.roleExists', 'Rôle existant'),
            description: t('admin.users.roleExistsDesc', 'Cet utilisateur a déjà ce rôle'),
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: t('admin.users.roleAdded', 'Rôle ajouté'),
          description: t('admin.users.roleAddedDesc', 'Le rôle a été attribué avec succès'),
        });
        fetchUsers();
      }
    } catch (error: any) {
      console.error('Error adding role:', error);
      toast({
        title: t('admin.users.error', 'Erreur'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setSelectedRole((prev) => ({ ...prev, [userId]: '' }));
    }
  };

  const removeRole = async (userId: string, roleToRemove: 'admin' | 'editor') => {
    setActionLoading(`remove-${userId}-${roleToRemove}`);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', roleToRemove);


      if (error) throw error;

      toast({
        title: t('admin.users.roleRemoved', 'Rôle supprimé'),
        description: t('admin.users.roleRemovedDesc', 'Le rôle a été retiré avec succès'),
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast({
        title: t('admin.users.error', 'Erreur'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="h-3 w-3" />;
      case 'editor':
        return <Shield className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'editor':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getAvailableRoles = (userRoles: string[]) => {
    const allRoles = ['admin', 'editor'];
    return allRoles.filter((role) => !userRoles.includes(role));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {t('admin.users.title', 'Gestion des utilisateurs')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('admin.users.totalUsers', '{{count}} utilisateur(s)', { count: users.length })}
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.users.email', 'Email')}</TableHead>
              <TableHead>{t('admin.users.roles', 'Rôles')}</TableHead>
              <TableHead>{t('admin.users.createdAt', 'Inscrit le')}</TableHead>
              <TableHead className="text-right">{t('admin.users.actions', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  {t('admin.users.noUsers', 'Aucun utilisateur trouvé')}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length === 0 ? (
                        <span className="text-sm text-muted-foreground">
                          {t('admin.users.noRole', 'Aucun rôle')}
                        </span>
                      ) : (
                          user.roles.map((r) => (
                          <Badge
                            key={r}
                            variant={getRoleBadgeVariant(r)}
                            className="flex items-center gap-1"
                          >
                            {getRoleIcon(r)}
                            {r === 'admin' ? 'Admin' : 'Éditeur'}
                            <button
                              type="button"
                              onClick={() => removeRole(user.id, r as 'admin' | 'editor')}
                              disabled={actionLoading === `remove-${user.id}-${r}`}
                              className="ml-1 hover:text-destructive transition-colors"
                              title={t('admin.users.removeRole', 'Retirer ce rôle')}
                            >
                              {actionLoading === `remove-${user.id}-${r}` ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {getAvailableRoles(user.roles).length > 0 && (
                      <div className="flex items-center justify-end gap-2">
                        <Select
                          value={selectedRole[user.id] || ''}
                          onValueChange={(value) =>
                            setSelectedRole((prev) => ({ ...prev, [user.id]: value }))
                          }
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder={t('admin.users.selectRole', 'Choisir...')} />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableRoles(user.roles).map((role) => (
                              <SelectItem key={role} value={role}>
                                {role === 'admin' ? 'Admin' : 'Éditeur'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={() => addRole(user.id, selectedRole[user.id] as 'admin' | 'editor')}
                          disabled={!selectedRole[user.id] || actionLoading === `add-${user.id}`}
                        >
                          {actionLoading === `add-${user.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <h3 className="font-medium mb-2">{t('admin.users.rolesInfo', 'Information sur les rôles')}</h3>
        <ul className="space-y-1 text-muted-foreground">
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <strong>Admin</strong>: {t('admin.users.adminDesc', 'Accès complet (gestion des utilisateurs, suppression de contenu)')}
          </li>
          <li className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-secondary-foreground" />
            <strong>Éditeur</strong>: {t('admin.users.editorDesc', 'Gestion du contenu (articles, pages, équipe, horaires)')}
          </li>
        </ul>
      </div>
    </div>
  );
}
