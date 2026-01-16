import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Mail, Users, MessageSquare, LogOut,
  Check, RefreshCw, LayoutDashboard, FileText,
  Calendar, UsersRound, Newspaper, Link as LinkIcon, ShieldCheck, Lock,
  HelpCircle, Heart
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import AdminArticles from '@/components/admin/AdminArticles';
import AdminPages from '@/components/admin/AdminPages';
import AdminTeam from '@/components/admin/AdminTeam';
import AdminMassSchedules from '@/components/admin/AdminMassSchedules';
import AdminMessages from '@/components/admin/AdminMessages';
import AdminNewsletter from '@/components/admin/AdminNewsletter';
import AdminFooterLinks from '@/components/admin/AdminFooterLinks';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminDocsPassword from '@/components/admin/AdminDocsPassword';
import AdminFAQ from '@/components/admin/AdminFAQ';
import AdminLifeStages from '@/components/admin/AdminLifeStages';
import ChangePasswordDialog from '@/components/admin/ChangePasswordDialog';

type TabType = 'messages' | 'subscribers' | 'articles' | 'pages' | 'team' | 'schedules' | 'footerLinks' | 'users' | 'docsPassword' | 'faq' | 'lifeStages';

interface Stats {
  messages: number;
  unread: number;
  subscribers: number;
  activeSubscribers: number;
}

const Admin = () => {
  const { t } = useTranslation();
  const { user, isLoading, isEditor, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>('articles');
  const [stats, setStats] = useState<Stats>({ messages: 0, unread: 0, subscribers: 0, activeSubscribers: 0 });
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStats();
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user && isEditor) {
      fetchStats();
    }
  }, [user, isEditor]);

  const fetchStats = async () => {
    try {
      const [messagesRes, subscribersRes] = await Promise.all([
        supabase.from('contact_messages').select('id, read'),
        supabase.from('newsletter_subscribers').select('id, active'),
      ]);

      setStats({
        messages: messagesRes.data?.length || 0,
        unread: messagesRes.data?.filter(m => !m.read).length || 0,
        subscribers: subscribersRes.data?.length || 0,
        activeSubscribers: subscribersRes.data?.filter(s => s.active).length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  if (!isEditor) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center px-4">
        <div className="card-parish p-8 text-center max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-heading font-bold text-foreground mb-2">
            {t('admin.accessDenied.title')}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t('admin.accessDenied.description')}
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/')} variant="outline">
              {t('admin.accessDenied.backToSite')}
            </Button>
            <Button onClick={handleSignOut} variant="destructive">
              <LogOut size={18} />
              {t('auth.logout')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <LayoutDashboard className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-foreground">
                {t('admin.title')}
              </h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{t('admin.actions.refresh')}</span>
            </Button>
            <ChangePasswordDialog />
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <span className="hidden sm:inline">{t('admin.actions.viewSite')}</span>
              <span className="sm:hidden">Site</span>
            </Button>
            <Button variant="destructive" size="sm" onClick={handleSignOut}>
              <LogOut size={16} />
              <span className="hidden sm:inline">{t('auth.logout')}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-parish p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MessageSquare className="text-primary" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.messages}</p>
                <p className="text-sm text-muted-foreground">{t('admin.stats.messages')}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-parish p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/20 rounded-lg">
                <Mail className="text-accent" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.unread}</p>
                <p className="text-sm text-muted-foreground">{t('admin.stats.unread')}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-parish p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/20 rounded-lg">
                <Users className="text-secondary" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.subscribers}</p>
                <p className="text-sm text-muted-foreground">{t('admin.stats.subscribers')}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-parish p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Check className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.activeSubscribers}</p>
                <p className="text-sm text-muted-foreground">{t('admin.stats.activeSubscribers')}</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeTab === 'articles' ? 'default' : 'outline'}
            onClick={() => setActiveTab('articles')}
            size="sm"
          >
            <Newspaper size={16} />
            {t('admin.tabs.articles')}
          </Button>
          <Button
            variant={activeTab === 'pages' ? 'default' : 'outline'}
            onClick={() => setActiveTab('pages')}
            size="sm"
          >
            <FileText size={16} />
            {t('admin.tabs.pages')}
          </Button>
          <Button
            variant={activeTab === 'team' ? 'default' : 'outline'}
            onClick={() => setActiveTab('team')}
            size="sm"
          >
            <UsersRound size={16} />
            {t('admin.tabs.team')}
          </Button>
          <Button
            variant={activeTab === 'schedules' ? 'default' : 'outline'}
            onClick={() => setActiveTab('schedules')}
            size="sm"
          >
            <Calendar size={16} />
            {t('admin.tabs.schedules')}
          </Button>
          <Button
            variant={activeTab === 'messages' ? 'default' : 'outline'}
            onClick={() => setActiveTab('messages')}
            size="sm"
          >
            <MessageSquare size={16} />
            {t('admin.tabs.messages')} {stats.unread > 0 && `(${stats.unread})`}
          </Button>
          <Button
            variant={activeTab === 'subscribers' ? 'default' : 'outline'}
            onClick={() => setActiveTab('subscribers')}
            size="sm"
          >
            <Users size={16} />
            {t('admin.tabs.newsletter')} ({stats.subscribers})
          </Button>
          <Button
            variant={activeTab === 'footerLinks' ? 'default' : 'outline'}
            onClick={() => setActiveTab('footerLinks')}
            size="sm"
          >
            <LinkIcon size={16} />
            {t('admin.tabs.footerLinks')}
          </Button>
          <Button
            variant={activeTab === 'faq' ? 'default' : 'outline'}
            onClick={() => setActiveTab('faq')}
            size="sm"
          >
            <HelpCircle size={16} />
            FAQ
          </Button>
          <Button
            variant={activeTab === 'lifeStages' ? 'default' : 'outline'}
            onClick={() => setActiveTab('lifeStages')}
            size="sm"
          >
            <Heart size={16} />
            Étapes de vie
          </Button>
          {isAdmin && (
            <Button
              variant={activeTab === 'users' ? 'default' : 'outline'}
              onClick={() => setActiveTab('users')}
              size="sm"
            >
              <ShieldCheck size={16} />
              {t('admin.tabs.users', 'Utilisateurs')}
            </Button>
          )}
          {isAdmin && (
            <Button
              variant={activeTab === 'docsPassword' ? 'default' : 'outline'}
              onClick={() => setActiveTab('docsPassword')}
              size="sm"
            >
              <Lock size={16} />
              {t('admin.tabs.docsPassword', 'Docs Équipes')}
            </Button>
          )}
        </div>

        <div className="card-parish overflow-hidden">
          {activeTab === 'articles' && <AdminArticles key={`articles-${refreshKey}`} />}
          {activeTab === 'pages' && <AdminPages key={`pages-${refreshKey}`} />}
          {activeTab === 'team' && <AdminTeam key={`team-${refreshKey}`} />}
          {activeTab === 'schedules' && <AdminMassSchedules key={`schedules-${refreshKey}`} />}
          {activeTab === 'messages' && <AdminMessages key={`messages-${refreshKey}`} />}
          {activeTab === 'subscribers' && <AdminNewsletter key={`subscribers-${refreshKey}`} />}
          {activeTab === 'footerLinks' && <AdminFooterLinks key={`footerLinks-${refreshKey}`} />}
          {activeTab === 'faq' && <AdminFAQ key={`faq-${refreshKey}`} />}
          {activeTab === 'lifeStages' && <AdminLifeStages key={`lifeStages-${refreshKey}`} />}
          {activeTab === 'users' && isAdmin && <AdminUsers refreshKey={refreshKey} />}
          {activeTab === 'docsPassword' && isAdmin && <AdminDocsPassword />}
        </div>
      </main>
    </div>
  );
};

export default Admin;
