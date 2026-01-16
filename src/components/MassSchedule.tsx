import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface MassSchedule {
  id: string;
  day_of_week: string;
  day_of_week_fr: string | null;
  day_of_week_pl: string | null;
  time: string;
  location: string | null;
  location_fr: string | null;
  location_pl: string | null;
  description: string | null;
  description_fr: string | null;
  description_pl: string | null;
  is_special: boolean;
  sort_order: number;
  language: string | null;
}

const DAY_ORDER = ['Dimanche', 'Samedi', 'En semaine'];

const MassScheduleSection = () => {
  const { t, i18n } = useTranslation();
  const [schedules, setSchedules] = useState<MassSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommunity, setSelectedCommunity] = useState<'fr' | 'pl'>('fr');

  const currentLang = i18n.language?.startsWith('pl') ? 'pl' : 'fr';

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const { data, error } = await supabase
      .from('mass_schedules')
      .select('*')
      .eq('active', true)
      .eq('is_special', false)
      .order('sort_order')
      .limit(12);

    if (data) setSchedules(data);
    if (error) console.error('Error fetching schedules:', error);
    setLoading(false);
  };

  // Filter schedules by selected community language
  const filteredSchedules = schedules.filter(s => 
    s.language === selectedCommunity || s.language === null
  );

  // Helper to get localized content
  const getLocalizedField = (schedule: MassSchedule, field: 'day_of_week' | 'location' | 'description') => {
    if (currentLang === 'pl') {
      const plField = schedule[`${field}_pl` as keyof MassSchedule] as string | null;
      if (plField) return plField;
    }
    const frField = schedule[`${field}_fr` as keyof MassSchedule] as string | null;
    if (frField) return frField;
    return schedule[field] as string | null;
  };

  // Group schedules by day type
  const groupedSchedules = DAY_ORDER.reduce((acc, dayType) => {
    let daySchedules: MassSchedule[];
    
    if (dayType === 'Dimanche') {
      daySchedules = filteredSchedules.filter(s => s.day_of_week.toLowerCase() === 'dimanche');
    } else if (dayType === 'Samedi') {
      daySchedules = filteredSchedules.filter(s => s.day_of_week.toLowerCase() === 'samedi');
    } else {
      daySchedules = filteredSchedules.filter(s => 
        !['dimanche', 'samedi'].includes(s.day_of_week.toLowerCase())
      );
    }
    
    if (daySchedules.length > 0) {
      acc.push({
        day: dayType,
        schedules: daySchedules,
        type: dayType === 'Dimanche' ? t('massSchedule.sundayMass') : 
              dayType === 'Samedi' ? t('massSchedule.saturdayMass') : 
              t('massSchedule.weekdayMass'),
      });
    }
    return acc;
  }, [] as { day: string; schedules: MassSchedule[]; type: string }[]);

  const getDayLabel = (day: string) => {
    if (day === 'En semaine') return t('massSchedule.weekdays');
    const dayMap: Record<string, string> = {
      'Dimanche': t('massSchedule.sunday'),
      'Samedi': t('massSchedule.saturday'),
    };
    return dayMap[day] || day;
  };

  const renderScheduleCards = () => (
    groupedSchedules.length === 0 ? (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('massSchedule.noSchedules')}</p>
      </div>
    ) : (
      <div className="grid md:grid-cols-3 gap-6">
        {groupedSchedules.map((group, index) => (
          <motion.div
            key={group.day}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card-parish p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-foreground">
                  {getDayLabel(group.day)}
                </h3>
                <p className="text-sm text-muted-foreground">{group.type}</p>
              </div>
            </div>

            <div className="space-y-3">
              {group.schedules.map((schedule) => {
                const localizedLocation = getLocalizedField(schedule, 'location');
                const localizedDayOfWeek = getLocalizedField(schedule, 'day_of_week');
                
                return (
                  <div key={schedule.id} className="flex items-start gap-3">
                    <Clock size={18} className="text-accent mt-0.5" />
                    <div>
                      <p className="text-foreground font-medium">
                        {schedule.time}
                        {schedule.day_of_week.toLowerCase() !== group.day.toLowerCase() && group.day === 'En semaine' && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({localizedDayOfWeek?.slice(0, 3) || schedule.day_of_week.slice(0, 3)})
                          </span>
                        )}
                      </p>
                      {localizedLocation && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin size={14} />
                          <span>{localizedLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    )
  );

  return (
    <section id="horaires" className="section-padding bg-muted">
      <div className="container-parish">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-accent font-semibold uppercase tracking-wider text-sm">
            {t('massSchedule.cta')}
          </span>
          <h2 className="mt-2 text-foreground">{t('massSchedule.title')}</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {t('massSchedule.description')}
          </p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card-parish p-6">
                <Skeleton className="h-8 w-32 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <Tabs value={selectedCommunity} onValueChange={(v) => setSelectedCommunity(v as 'fr' | 'pl')} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-background">
                <TabsTrigger value="fr" className="px-6 gap-2">
                  🇫🇷 {t('massSchedule.frenchMasses')}
                </TabsTrigger>
                <TabsTrigger value="pl" className="px-6 gap-2">
                  🇵🇱 {t('massSchedule.polishMasses')}
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="fr">{renderScheduleCards()}</TabsContent>
            <TabsContent value="pl">{renderScheduleCards()}</TabsContent>
          </Tabs>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-muted-foreground mb-4">
            {t('massSchedule.notice')}
          </p>
          <Link to="/horaires" className="btn-parish">
            {t('massSchedule.viewAll')}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default MassScheduleSection;