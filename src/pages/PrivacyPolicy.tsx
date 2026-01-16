import DynamicLegalPage from '@/components/DynamicLegalPage';

const PrivacyPolicy = () => {
  return (
    <DynamicLegalPage 
      slug="confidentialite"
      fallbackTitleFr="Politique de Confidentialité"
      fallbackTitlePl="Polityka Prywatności"
    />
  );
};

export default PrivacyPolicy;
