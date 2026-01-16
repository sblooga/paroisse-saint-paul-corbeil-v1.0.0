import DynamicLegalPage from '@/components/DynamicLegalPage';

const LegalNotice = () => {
  return (
    <DynamicLegalPage 
      slug="mentions-legales"
      fallbackTitleFr="Mentions Légales"
      fallbackTitlePl="Informacje prawne"
    />
  );
};

export default LegalNotice;
