import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <section className="w-full max-w-md">
        <div className="bg-card text-card-foreground border border-border rounded-xl shadow-card p-8 text-center">
          <h1 className="mb-2 text-5xl font-heading font-bold">404</h1>
          <p className="mb-6 text-base text-muted-foreground">Oops ! Page introuvable</p>
          <Link to="/" className="text-primary underline underline-offset-4 hover:text-primary/90">
            Retour à l'accueil
          </Link>
        </div>
      </section>
    </main>
  );
};

export default NotFound;
