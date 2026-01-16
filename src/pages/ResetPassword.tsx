import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, KeyRound, AlertCircle, Check, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

interface PasswordStrength {
  score: number;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

const checkPasswordStrength = (password: string): PasswordStrength => {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'`~]/.test(password);

  let score = 0;
  if (hasMinLength) score++;
  if (hasUppercase) score++;
  if (hasLowercase) score++;
  if (hasNumber) score++;
  if (hasSpecialChar) score++;

  return { score, hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar };
};

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const passwordStrength = useMemo(() => checkPasswordStrength(password), [password]);
  const isPasswordStrong = passwordStrength.score >= 4;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  useEffect(() => {
    // Check if we have an access token in the URL (from the reset email link)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    
    if (!accessToken || type !== 'recovery') {
      // No valid recovery token, redirect to auth
      toast({
        title: t('auth.errors.invalidResetLink', 'Lien invalide'),
        description: t('auth.errors.invalidResetLinkDesc', 'Ce lien de réinitialisation est invalide ou a expiré.'),
        variant: 'destructive',
      });
      navigate('/auth');
    }
  }, [navigate, toast, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordStrong) {
      setError(t('auth.errors.weakPassword', 'Le mot de passe n\'est pas assez fort.'));
      return;
    }

    if (!passwordsMatch) {
      setError(t('auth.errors.passwordsMismatch', 'Les mots de passe ne correspondent pas.'));
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        toast({
          title: t('auth.passwordUpdated', 'Mot de passe mis à jour'),
          description: t('auth.passwordUpdatedDesc', 'Votre mot de passe a été modifié avec succès.'),
        });
        
        // Redirect to admin after a short delay
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      }
    } catch (err) {
      setError(t('auth.errors.generic', 'Une erreur est survenue. Veuillez réessayer.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength.score <= 2) return 'bg-destructive';
    if (passwordStrength.score === 3) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (passwordStrength.score <= 2) return t('auth.passwordStrength.weak', 'Faible');
    if (passwordStrength.score === 3) return t('auth.passwordStrength.medium', 'Moyen');
    if (passwordStrength.score === 4) return t('auth.passwordStrength.strong', 'Fort');
    return t('auth.passwordStrength.veryStrong', 'Très fort');
  };

  const RequirementItem = ({ met, label }: { met: boolean; label: string }) => (
    <div className={`flex items-center gap-2 text-xs ${met ? 'text-green-600' : 'text-muted-foreground'}`}>
      {met ? <Check size={14} className="text-green-600" /> : <X size={14} className="text-muted-foreground" />}
      <span>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card-parish p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="text-primary" size={32} />
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              {t('auth.resetPassword', 'Nouveau mot de passe')}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t('auth.resetPasswordSubtitle', 'Choisissez un nouveau mot de passe sécurisé')}
            </p>
          </div>

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3 text-foreground">
              <Check size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-green-700 dark:text-green-400">
                  {t('auth.passwordUpdated', 'Mot de passe mis à jour !')}
                </p>
                <p className="text-muted-foreground mt-1">
                  {t('auth.redirecting', 'Redirection en cours...')}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive">
              <AlertCircle size={20} />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.newPassword', 'Nouveau mot de passe')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 space-y-3"
                  >
                    {/* Strength bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {t('auth.passwordStrength.label', 'Force du mot de passe')}
                        </span>
                        <span className={passwordStrength.score <= 2 ? 'text-destructive' : passwordStrength.score === 3 ? 'text-amber-500' : 'text-green-600'}>
                          {getStrengthLabel()}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          className={`h-full ${getStrengthColor()} transition-all duration-300`}
                        />
                      </div>
                    </div>

                    {/* Requirements checklist */}
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded-lg">
                      <RequirementItem
                        met={passwordStrength.hasMinLength}
                        label={t('auth.requirements.minLength', '8 caractères min.')}
                      />
                      <RequirementItem
                        met={passwordStrength.hasUppercase}
                        label={t('auth.requirements.uppercase', '1 majuscule')}
                      />
                      <RequirementItem
                        met={passwordStrength.hasLowercase}
                        label={t('auth.requirements.lowercase', '1 minuscule')}
                      />
                      <RequirementItem
                        met={passwordStrength.hasNumber}
                        label={t('auth.requirements.number', '1 chiffre')}
                      />
                      <RequirementItem
                        met={passwordStrength.hasSpecialChar}
                        label={t('auth.requirements.special', '1 caractère spécial')}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.confirmPassword', 'Confirmer le mot de passe')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
                {confirmPassword.length > 0 && (
                  <div className={`flex items-center gap-2 text-xs ${passwordsMatch ? 'text-green-600' : 'text-destructive'}`}>
                    {passwordsMatch ? <Check size={14} /> : <X size={14} />}
                    <span>
                      {passwordsMatch 
                        ? t('auth.passwordsMatch', 'Les mots de passe correspondent')
                        : t('auth.passwordsDontMatch', 'Les mots de passe ne correspondent pas')
                      }
                    </span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full btn-parish"
                disabled={isSubmitting || !isPasswordStrong || !passwordsMatch}
              >
                {isSubmitting ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <>
                    <KeyRound size={18} />
                    {t('auth.updatePassword', 'Mettre à jour le mot de passe')}
                  </>
                )}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          <Link to="/auth" className="hover:text-primary transition-colors">
            ← {t('auth.backToLogin', 'Retour à la connexion')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
