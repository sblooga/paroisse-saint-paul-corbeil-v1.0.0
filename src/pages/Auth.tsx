import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, Info, Check, X, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
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

type AuthMode = 'login' | 'signup' | 'forgot';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<AuthMode>('login');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const passwordStrength = useMemo(() => checkPasswordStrength(password), [password]);

  const isPasswordStrong = passwordStrength.score >= 4;

  useEffect(() => {
    if (user) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && !isPasswordStrong) {
      setError(t('auth.errors.weakPassword', 'Le mot de passe n\'est pas assez fort.'));
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'forgot') {
        const redirectUrl = `${window.location.origin}/reset-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });
        
        if (error) {
          setError(error.message);
        } else {
          setResetEmailSent(true);
          toast({
            title: t('auth.resetEmailSent', 'Email envoyé'),
            description: t('auth.resetEmailSentDesc', 'Vérifiez votre boîte de réception pour réinitialiser votre mot de passe.'),
          });
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            setError(t('auth.errors.alreadyRegistered', 'Cet email est déjà enregistré.'));
          } else {
            setError(error.message);
          }
        } else {
          toast({
            title: t('auth.signUpSuccess', 'Inscription réussie'),
            description: t('auth.signUpSuccessDesc', 'Votre compte a été créé. Un administrateur vous attribuera un rôle.'),
          });
          setMode('login');
          setPassword('');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError(t('auth.errors.invalidCredentials', 'Email ou mot de passe incorrect.'));
          } else {
            setError(error.message);
          }
        } else {
          toast({
            title: t('auth.loginSuccess', 'Connexion réussie'),
            description: t('auth.loginSuccessDesc', 'Bienvenue dans l\'espace administrateur.'),
          });
          navigate('/admin');
        }
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

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setPassword('');
    setResetEmailSent(false);
  };

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
              <span className="text-3xl">✝️</span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              {mode === 'forgot' 
                ? t('auth.forgotPassword', 'Mot de passe oublié')
                : t('auth.adminSpace', 'Espace Administrateur')
              }
            </h1>
            <p className="text-muted-foreground mt-2">
              {mode === 'forgot'
                ? t('auth.forgotSubtitle', 'Entrez votre email pour recevoir un lien de réinitialisation')
                : mode === 'signup' 
                  ? t('auth.signUpSubtitle', 'Créez votre compte pour accéder au tableau de bord')
                  : t('auth.loginSubtitle', 'Connectez-vous pour accéder au tableau de bord')
              }
            </p>
          </div>

          {mode === 'signup' && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-start gap-3 text-foreground">
              <Info size={20} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                {t('auth.roleInfo', 'Après votre inscription, un administrateur vous attribuera les droits d\'accès nécessaires.')}
              </p>
            </div>
          )}

          {mode === 'forgot' && resetEmailSent && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3 text-foreground">
              <Check size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-green-700 dark:text-green-400">
                  {t('auth.resetEmailSent', 'Email envoyé !')}
                </p>
                <p className="text-muted-foreground mt-1">
                  {t('auth.checkInbox', 'Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.')}
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@paroisse.fr"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password', 'Mot de passe')}</Label>
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

                {mode === 'signup' && password.length > 0 && (
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

                {mode === 'login' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs text-primary hover:underline"
                    >
                      {t('auth.forgotPasswordLink', 'Mot de passe oublié ?')}
                    </button>
                  </div>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full btn-parish"
              disabled={isSubmitting || (mode === 'signup' && !isPasswordStrong) || (mode === 'forgot' && resetEmailSent)}
            >
              {isSubmitting ? (
                <span className="animate-spin">⏳</span>
              ) : mode === 'forgot' ? (
                <>
                  <KeyRound size={18} />
                  {t('auth.sendResetLink', 'Envoyer le lien')}
                </>
              ) : mode === 'signup' ? (
                <>
                  <UserPlus size={18} />
                  {t('auth.signUp', 'S\'inscrire')}
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  {t('auth.login', 'Se connecter')}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {mode === 'forgot' ? (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-sm text-primary hover:underline"
              >
                {t('auth.backToLogin', '← Retour à la connexion')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                className="text-sm text-primary hover:underline"
              >
                {mode === 'signup' 
                  ? t('auth.alreadyAccount', 'Déjà un compte ? Se connecter')
                  : t('auth.noAccount', 'Pas de compte ? S\'inscrire')
                }
              </button>
            )}
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">
            ← {t('auth.backToSite', 'Retour au site')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
