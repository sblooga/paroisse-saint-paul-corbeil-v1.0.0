import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminDocsPassword = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('pl') ? 'pl' : 'fr';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const content = {
    fr: {
      title: 'Mot de passe Docs Équipes',
      description: 'Modifiez le code d\'accès à 6 chiffres pour la page Docs Équipes.',
      newPassword: 'Nouveau code',
      confirmPassword: 'Confirmer le code',
      passwordPlaceholder: '000000',
      save: 'Enregistrer',
      success: 'Code modifié avec succès',
      error: 'Erreur lors de la modification',
      mismatch: 'Les codes ne correspondent pas',
      invalid: 'Le code doit contenir exactement 6 chiffres',
    },
    pl: {
      title: 'Hasło Dokumentów Zespołów',
      description: 'Zmień 6-cyfrowy kod dostępu do strony Dokumenty Zespołów.',
      newPassword: 'Nowy kod',
      confirmPassword: 'Potwierdź kod',
      passwordPlaceholder: '000000',
      save: 'Zapisz',
      success: 'Kod zmieniony pomyślnie',
      error: 'Błąd podczas zmiany',
      mismatch: 'Kody nie są zgodne',
      invalid: 'Kod musi zawierać dokładnie 6 cyfr',
    },
  };

  const t = content[currentLang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (newPassword.length !== 6 || !/^\d{6}$/.test(newPassword)) {
      toast.error(t.invalid);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t.mismatch);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.rpc('update_docs_password', {
        new_password: newPassword
      });

      if (error) throw error;

      toast.success(t.success);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-heading font-semibold">{t.title}</h2>
          <p className="text-sm text-muted-foreground">{t.description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">{t.newPassword}</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={t.passwordPlaceholder}
              className="text-center text-xl tracking-[0.5em] font-mono pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder={t.passwordPlaceholder}
            className="text-center text-xl tracking-[0.5em] font-mono"
          />
        </div>

        <Button 
          type="submit" 
          disabled={isLoading || newPassword.length !== 6 || confirmPassword.length !== 6}
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? '...' : t.save}
        </Button>
      </form>
    </motion.div>
  );
};

export default AdminDocsPassword;