import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, KeyRound, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PasswordStrength {
  score: number;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

const checkPasswordStrength = (password: string): PasswordStrength => {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const score = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
  
  return { score, hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial };
};

const ChangePasswordDialog = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrength = checkPasswordStrength(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isValid = passwordStrength.score >= 4 && passwordsMatch;

  const getStrengthColor = () => {
    if (passwordStrength.score <= 2) return 'bg-destructive';
    if (passwordStrength.score <= 3) return 'bg-amber-500';
    return 'bg-secondary';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: t('admin.changePassword.success', 'Mot de passe modifié'),
        description: t('admin.changePassword.successDescription', 'Votre mot de passe a été mis à jour avec succès.'),
      });

      setOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: t('common.error', 'Erreur'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <KeyRound size={16} />
          {t('admin.changePassword.button', 'Mot de passe')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('admin.changePassword.title', 'Changer mon mot de passe')}</DialogTitle>
          <DialogDescription>
            {t('admin.changePassword.description', 'Entrez votre nouveau mot de passe.')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t('admin.changePassword.newPassword', 'Nouveau mot de passe')}</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            {newPassword && (
              <>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${getStrengthColor()}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
                
                <div className="space-y-1 text-sm">
                  <RequirementItem met={passwordStrength.hasMinLength} text={t('auth.passwordRequirements.minLength', '8 caractères minimum')} />
                  <RequirementItem met={passwordStrength.hasUppercase} text={t('auth.passwordRequirements.uppercase', 'Une majuscule')} />
                  <RequirementItem met={passwordStrength.hasLowercase} text={t('auth.passwordRequirements.lowercase', 'Une minuscule')} />
                  <RequirementItem met={passwordStrength.hasNumber} text={t('auth.passwordRequirements.number', 'Un chiffre')} />
                  <RequirementItem met={passwordStrength.hasSpecial} text={t('auth.passwordRequirements.special', 'Un caractère spécial')} />
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('admin.changePassword.confirmPassword', 'Confirmer le mot de passe')}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <X size={14} />
                {t('admin.changePassword.passwordsMismatch', 'Les mots de passe ne correspondent pas')}
              </p>
            )}
            {passwordsMatch && (
              <p className="text-sm text-secondary flex items-center gap-1">
                <Check size={14} />
                {t('admin.changePassword.passwordsMatch', 'Les mots de passe correspondent')}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('common.cancel', 'Annuler')}
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? t('common.loading', 'Chargement...') : t('common.save', 'Enregistrer')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
  <div className={`flex items-center gap-2 ${met ? 'text-secondary' : 'text-muted-foreground'}`}>
    {met ? <Check size={14} /> : <X size={14} />}
    <span>{text}</span>
  </div>
);

export default ChangePasswordDialog;
