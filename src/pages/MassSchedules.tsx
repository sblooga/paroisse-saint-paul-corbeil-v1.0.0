import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Calendar as CalendarIcon, Star, ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isAfter, startOfDay } from 'date-fns';
import { fr, pl } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface MassSchedule {
  id: string;
  day_of_week: string;
  time: string;
  location: string | null;
  description: string | null;
  is_special: boolean;
  special_date: string | null;
  sort_order: number;
  language: string | null;
}

const DAY_ORDER = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const MassSchedules = () => {
  const { t, i18n } = useTranslation();
  const [schedules, setSchedules] = useState<MassSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [languageFilter, setLanguageFilter] = useState<'all' | 'fr' | 'pl'>('all');

  const currentLang = i18n.language?.startsWith('pl') ? 'pl' : 'fr';
  const dateLocale = currentLang === 'pl' ? pl : fr;

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const { data, error } = await supabase
      .from('mass_schedules')
      .select('*')
      .eq('active', true)
      .order('sort_order');

    if (data) setSchedules(data);
    if (error) console.error('Error fetching schedules:', error);
    setLoading(false);
  };

  // Filter schedules by language
  const filteredSchedules = schedules.filter(s => {
    if (languageFilter === 'all') return true;
    return s.language === languageFilter;
  });

  // Group regular schedules by day
  const regularSchedules = filteredSchedules.filter(s => !s.is_special);
  const specialSchedules = filteredSchedules.filter(s => s.is_special && s.special_date);

  const groupedSchedules = DAY_ORDER.reduce((acc, day) => {
    const daySchedules = regularSchedules.filter(s => s.day_of_week === day);
    if (daySchedules.length > 0) {
      acc[day] = daySchedules;
    }
    return acc;
  }, {} as Record<string, MassSchedule[]>);

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  const startDayOfWeek = monthStart.getDay();
  
  // Padding days before the month starts
  const paddingDays = Array(startDayOfWeek).fill(null);

  const getSpecialEventsForDate = (date: Date) => {
    return specialSchedules.filter(s => {
      if (!s.special_date) return false;
      const eventDate = new Date(s.special_date);
      return isSameDay(eventDate, date);
    });
  };

  const hasSpecialEvent = (date: Date) => {
    return getSpecialEventsForDate(date).length > 0;
  };

  // Get future special events sorted by date
  const getFutureEvents = () => {
    const today = startOfDay(new Date());
    return specialSchedules
      .filter(s => s.special_date && isAfter(new Date(s.special_date), today))
      .sort((a, b) => new Date(a.special_date!).getTime() - new Date(b.special_date!).getTime());
  };

  const futureEvents = getFutureEvents();
  const nextEventDate = futureEvents.length > 0 ? new Date(futureEvents[0].special_date!) : null;
  const upcomingEvents = futureEvents.slice(0, 5);

  const goToNextEvent = () => {
    if (nextEventDate) {
      setCurrentMonth(startOfMonth(nextEventDate));
      setSelectedDate(nextEventDate);
    }
  };

  const getDayName = (day: string) => {
    const dayMap: Record<string, string> = {
      'Dimanche': t('massSchedule.sunday'),
      'Lundi': t('massSchedule.monday'),
      'Mardi': t('massSchedule.tuesday'),
      'Mercredi': t('massSchedule.wednesday'),
      'Jeudi': t('massSchedule.thursday'),
      'Vendredi': t('massSchedule.friday'),
      'Samedi': t('massSchedule.saturday'),
    };
    return dayMap[day] || day;
  };

  const selectedDateEvents = selectedDate ? getSpecialEventsForDate(selectedDate) : [];

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
                {t('massSchedule.subtitle')}
              </span>
              <h1 className="mt-2 text-foreground">{t('massSchedule.title')}</h1>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
                {t('massSchedule.description')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Regular Schedules with Language Tabs */}
        <section className="section-padding">
          <div className="container-parish">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-heading font-bold text-foreground mb-6 text-center">
                {t('massSchedule.regularSchedules')}
              </h2>
              
              {/* Language Tabs */}
              <Tabs value={languageFilter} onValueChange={(v) => setLanguageFilter(v as 'all' | 'fr' | 'pl')} className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    {t('massSchedule.allMasses')}
                  </TabsTrigger>
                  <TabsTrigger value="fr" className="flex items-center gap-2">
                    🇫🇷 {t('massSchedule.frenchMasses')}
                  </TabsTrigger>
                  <TabsTrigger value="pl" className="flex items-center gap-2">
                    🇵🇱 {t('massSchedule.polishMasses')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </motion.div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card-parish p-6">
                    <Skeleton className="h-8 w-32 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : Object.keys(groupedSchedules).length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t('massSchedule.noSchedules')}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(groupedSchedules).map(([day, daySchedules], index) => (
                  <motion.div
                    key={day}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="card-parish p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <CalendarIcon className="text-primary" size={24} />
                      </div>
                      <h3 className="text-xl font-heading font-bold text-foreground">
                        {getDayName(day)}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {daySchedules.map((schedule) => (
                        <div key={schedule.id} className="border-l-2 border-primary/30 pl-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock size={16} className="text-accent" />
                            <span className="font-semibold text-foreground">{schedule.time}</span>
                          </div>
                          {schedule.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin size={14} />
                              <span>{schedule.location}</span>
                            </div>
                          )}
                          {schedule.description && (
                            <p className="text-sm text-muted-foreground mt-1">{schedule.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Interactive Calendar */}
        <section className="section-padding bg-muted">
          <div className="container-parish">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-heading font-bold text-foreground mb-8 text-center"
            >
              {t('massSchedule.specialEvents')}
            </motion.h2>

            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="card-parish p-6"
              >
                {/* Calendar Header */}
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    >
                      ←
                    </Button>
                    <h3 className="text-xl font-heading font-bold text-foreground capitalize">
                      {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    >
                      →
                    </Button>
                  </div>
                  
                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(startOfMonth(new Date()))}
                      className="flex items-center gap-2"
                    >
                      <Home size={16} />
                      {t('massSchedule.today')}
                    </Button>

                    <Button
                      variant={nextEventDate ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={nextEventDate ? goToNextEvent : undefined}
                      disabled={!nextEventDate}
                      className="flex items-center gap-2"
                      aria-disabled={!nextEventDate}
                      title={!nextEventDate ? t('massSchedule.noNextEvent') : undefined}
                    >
                      <Star size={16} />
                      {nextEventDate ? t('massSchedule.nextEvent') : t('massSchedule.noNextEvent')}
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {/* Day headers */}
                  {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-sm font-semibold text-muted-foreground py-2">
                      {currentLang === 'pl' 
                        ? ['N', 'P', 'W', 'Ś', 'C', 'P', 'S'][i]
                        : day
                      }
                    </div>
                  ))}
                  
                  {/* Padding days */}
                  {paddingDays.map((_, i) => (
                    <div key={`pad-${i}`} className="aspect-square" />
                  ))}
                  
                  {/* Calendar days */}
                  {daysInMonth.map((day) => {
                    const hasEvent = hasSpecialEvent(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(hasEvent ? day : null)}
                        className={cn(
                          "aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors relative",
                          hasEvent && "cursor-pointer",
                          !hasEvent && "cursor-default",
                          isSelected && "bg-primary text-primary-foreground",
                          !isSelected && isToday && "bg-accent/20 text-accent-foreground font-bold",
                          !isSelected && !isToday && hasEvent && "bg-secondary/20 hover:bg-secondary/40",
                          !isSelected && !isToday && !hasEvent && "text-foreground"
                        )}
                      >
                        {format(day, 'd')}
                        {hasEvent && !isSelected && (
                          <Star size={10} className="text-secondary absolute bottom-1" fill="currentColor" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected date events */}
                {selectedDate && selectedDateEvents.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t pt-4 mt-4"
                  >
                    <h4 className="font-semibold text-foreground mb-3">
                      {format(selectedDate, 'EEEE d MMMM yyyy', { locale: dateLocale })}
                    </h4>
                    <div className="space-y-3">
                      {selectedDateEvents.map((event) => (
                        <div key={event.id} className="flex items-start gap-3 p-3 bg-secondary/10 rounded-lg">
                          <Star size={18} className="text-secondary mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-accent" />
                              <span className="font-semibold">{event.time}</span>
                            </div>
                            {event.description && (
                              <p className="text-muted-foreground text-sm mt-1">{event.description}</p>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <MapPin size={12} />
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-accent/20" />
                    <span>{t('massSchedule.today')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star size={12} className="text-secondary" fill="currentColor" />
                    <span>{t('massSchedule.specialEvent')}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Upcoming Events List */}
        {upcomingEvents.length > 0 && (
          <section className="section-padding">
            <div className="container-parish">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-heading font-bold text-foreground mb-8 text-center"
              >
                {t('massSchedule.upcomingEvents')}
              </motion.h2>

              <div className="max-w-2xl mx-auto space-y-4">
                {upcomingEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="card-parish p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      if (event.special_date) {
                        const eventDate = new Date(event.special_date);
                        setCurrentMonth(startOfMonth(eventDate));
                        setSelectedDate(eventDate);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                  >
                    {/* Date Badge */}
                    <div className="flex-shrink-0 bg-primary/10 rounded-lg p-3 text-center min-w-[70px]">
                      <div className="text-2xl font-bold text-primary">
                        {event.special_date ? format(new Date(event.special_date), 'd', { locale: dateLocale }) : ''}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase">
                        {event.special_date ? format(new Date(event.special_date), 'MMM', { locale: dateLocale }) : ''}
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">{event.day_of_week}</span>
                        <Badge variant="outline" className="text-xs">
                          {event.language === 'pl' ? '🇵🇱' : '🇫🇷'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock size={14} />
                        <span>{event.time}</span>
                        {event.location && (
                          <>
                            <span>•</span>
                            <MapPin size={14} />
                            <span>{event.location}</span>
                          </>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      )}
                    </div>

                    <ChevronRight size={20} className="text-muted-foreground flex-shrink-0" />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section-padding">
          <div className="container-parish text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-muted-foreground mb-4">
                {t('massSchedule.confessions')}
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

export default MassSchedules;