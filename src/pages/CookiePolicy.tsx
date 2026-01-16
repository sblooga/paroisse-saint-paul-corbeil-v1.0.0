import DynamicLegalPage from '@/components/DynamicLegalPage';

const CookiePolicy = () => {
  return (
    <DynamicLegalPage 
      slug="cookies"
      fallbackTitleFr="Politique des Cookies"
      fallbackTitlePl="Polityka Cookies"
    />
  );
};

export default CookiePolicy;
