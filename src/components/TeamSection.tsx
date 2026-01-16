import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface TeamMemberPublic {
  id: string;
  name: string;
  role: string;
  category: string;
  photo_url: string | null;
  name_fr: string | null;
  name_pl: string | null;
  role_fr: string | null;
  role_pl: string | null;
  community: string | null;
}

const TeamSection = () => {
  const { t, i18n } = useTranslation();
  const [members, setMembers] = useState<TeamMemberPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommunity, setSelectedCommunity] = useState<'fr' | 'pl'>('fr');

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

  // Filter members by selected community
  const filteredMembers = members.filter(m => 
    m.community === selectedCommunity || m.community === 'both' || m.community === null
  ).slice(0, 6);

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

  const renderMemberCards = () => (
    filteredMembers.length === 0 ? (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('common.noResults')}</p>
      </div>
    ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
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
                <div className="w-full h-full rounded-full bg-background border-4 border-accent shadow-lg flex items-center justify-center text-2xl font-bold text-muted-foreground">
                  {getLocalizedName(member).charAt(0)}
                </div>
              )}
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full whitespace-nowrap">
                {getCategoryLabel(member.category)}
              </span>
            </div>

            <h3 className="text-lg font-heading font-bold text-foreground mt-4">
              {getLocalizedName(member)}
            </h3>
            <p className="text-muted-foreground text-sm">{getLocalizedRole(member)}</p>
          </motion.div>
        ))}
      </div>
    )
  );

  return (
    <section id="equipes" className="section-padding bg-muted">
      <div className="container-parish">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-primary font-semibold uppercase tracking-wider text-sm">
            {t('team.subtitle')}
          </span>
          <h2 className="mt-2 text-foreground">{t('team.title')}</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {t('team.description')}
          </p>
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
        ) : (
          <Tabs value={selectedCommunity} onValueChange={(v) => setSelectedCommunity(v as 'fr' | 'pl')} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-background">
                <TabsTrigger value="fr" className="px-6 gap-2">
                  🇫🇷 {t('team.frenchTeam')}
                </TabsTrigger>
                <TabsTrigger value="pl" className="px-6 gap-2">
                  🇵🇱 {t('team.polishTeam')}
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="fr">{renderMemberCards()}</TabsContent>
            <TabsContent value="pl">{renderMemberCards()}</TabsContent>
          </Tabs>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Link to="/equipe" className="btn-parish">
            {t('team.discoverAll')}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default TeamSection;
