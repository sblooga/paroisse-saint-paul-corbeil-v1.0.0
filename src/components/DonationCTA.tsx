import { Heart, CreditCard, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const DonationCTA = () => {
  const { t } = useTranslation();

  return (
    <section id="don" className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-primary" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container-parish relative px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center p-4 bg-accent/20 rounded-full mb-6">
              <Heart className="text-accent" size={32} />
            </div>
            
            <h2 className="text-primary-foreground mb-4">
              {t('donation.title')}
            </h2>
            
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
              {t('donation.description')}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto mb-8">
              <motion.a
                href="#"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-accent text-accent-foreground rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                <CreditCard size={20} />
                {t('donation.oneTime')}
              </motion.a>
              
              <motion.a
                href="#"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-primary-foreground text-primary rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                <Gift size={20} />
                {t('donation.monthly')}
              </motion.a>
            </div>

            <p className="text-primary-foreground/60 text-sm">
              💳 {t('donation.securePayment')}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DonationCTA;