import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TeamMemberPublic {
  id: string;
  name: string;
  role: string;
  category: string;
  photo_url: string | null;
  bio: string | null;
  name_fr: string | null;
  name_pl: string | null;
  role_fr: string | null;
  role_pl: string | null;
  bio_fr: string | null;
  bio_pl: string | null;
  sort_order: number;
  community?: string | null;
}

const CATEGORY_ORDER = ['priests', 'team', 'services', 'secretariat', 'choir'];

const Team = () => {
  const { t, i18n } = useTranslation();
  const [members, setMembers] = useState<TeamMemberPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [communityFilter, setCommunityFilter] = useState<'fr' | 'pl'>('fr');

  const currentLang = i18n.language?.startsWith('pl') ? 'pl' : 'fr';

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    // Use secure function that excludes sensitive contact information (email, phone)
    const { data, error } = await supabase.rpc('get_team_members_public');

    if (data) setMembers(data as TeamMemberPublic[]);
    if (error) console.error('Error fetching team members:', error);
    setLoading(false);
  };

  const getCategoryLabel = (category: string) => {
    return t(`team.categories.${category}`, { defaultValue: category });
  };

  const getLocalizedName = (member: TeamMemberPublic) => {
    if (currentLang === 'pl' && member.name_pl) return member.name_pl;
    return member.name_fr || member.name;
  };

  const getLocalizedRole = (member: TeamMemberPublic) => {
    if (currentLang === 'pl' && member.role_pl) return member.role_pl;
    return member.role_fr || member.role;
  };

  const getLocalizedBio = (member: TeamMemberPublic) => {
    if (currentLang === 'pl' && member.bio_pl) return member.bio_pl;
    return member.bio_fr || member.bio;
  };

  // Filter members by community
  const filteredMembers = members.filter(m => {
    if (m.community === 'both') return true;
    return m.community === communityFilter;
  });

  const groupedMembers = CATEGORY_ORDER.reduce((acc, category) => {
    const categoryMembers = filteredMembers.filter(m => m.category === category);
    if (categoryMembers.length > 0) {
      acc[category] = categoryMembers;
    }
    return acc;
  }, {} as Record<string, TeamMemberPublic[]>);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-primary/5 py-16">
          <div className="container-parish text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-primary font-semibold uppercase tracking-wider text-sm">
                {t('team.subtitle')}
              </span>
              <h1 className="mt-2 text-foreground">{t('team.title')}</h1>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
                {t('team.description')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Team Members */}
        <section className="section-padding">
          <div className="container-parish">
            {/* Community Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Tabs value={communityFilter} onValueChange={(v) => setCommunityFilter(v as 'fr' | 'pl')} className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                  <TabsTrigger value="fr" className="flex items-center gap-2">
                    🇫🇷 {t('team.frenchTeam')}
                  </TabsTrigger>
                  <TabsTrigger value="pl" className="flex items-center gap-2">
                    🇵🇱 {t('team.polishTeam')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </motion.div>

            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card-parish p-6 text-center">
                    <Skeleton className="w-28 h-28 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-6 w-32 mx-auto mb-2" />
                    <Skeleton className="h-4 w-24 mx-auto mb-4" />
                  </div>
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">{t('team.noMembers')}</p>
              </div>
            ) : (
              <div className="space-y-16">
                {Object.entries(groupedMembers).map(([category, categoryMembers], categoryIndex) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                  >
                    <h2 className="text-2xl font-heading font-bold text-foreground mb-8 text-center">
                      {getCategoryLabel(category)}
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {categoryMembers.map((member, index) => (
                        <motion.div
                          key={member.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="card-parish p-6 text-center group"
                        >
                          <div className="relative mb-4 mx-auto w-28 h-28">
                            {member.photo_url ? (
                              <img
                                src={member.photo_url}
                                alt={getLocalizedName(member)}
                                className="w-full h-full rounded-full object-cover border-4 border-accent shadow-lg group-hover:border-primary transition-colors"
                              />
                            ) : (
                              <div className="w-full h-full rounded-full bg-muted border-4 border-accent shadow-lg flex items-center justify-center text-2xl font-bold text-muted-foreground">
                                {getLocalizedName(member).charAt(0)}
                              </div>
                            )}
                          </div>

                          <h3 className="text-lg font-heading font-bold text-foreground mt-4">
                            {getLocalizedName(member)}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-2">{getLocalizedRole(member)}</p>
                          
                          {getLocalizedBio(member) && (
                            <p className="text-muted-foreground text-sm line-clamp-3">
                              {getLocalizedBio(member)}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Contact CTA - Users can contact via the contact form or WhatsApp */}
            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-6">
                {t('team.contactInfo')}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/contact" className="btn-parish-outline">
                  {t('common.contact')}
                </Link>
                <a
                  href="https://wa.me/33164960901"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all hover:scale-105 animate-pulse hover:animate-none"
                >
                  <MessageCircle size={20} />
                  {t('team.whatsappSecretariat')}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-muted">
          <div className="container-parish text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
                {t('team.question')}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                {t('team.contactCta')}
              </p>
              <Link to="/contact" className="btn-parish">
                {t('common.contact')}
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Team;
