import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type CheckStatus = 'idle' | 'loading' | 'ok' | 'error';

const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:10000/api').replace(/\/$/, '');

const Diagnostics = () => {
  const [healthStatus, setHealthStatus] = useState<CheckStatus>('idle');
  const [healthMessage, setHealthMessage] = useState('');
  const [articlesStatus, setArticlesStatus] = useState<CheckStatus>('idle');
  const [articlesCount, setArticlesCount] = useState<number | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    runHealthCheck();
  }, []);

  const runHealthCheck = async () => {
    setHealthStatus('loading');
    setErrorDetails(null);
    try {
      const res = await fetch(`${apiBase}/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHealthMessage(`${data.status || 'ok'} - ${data.message || ''}`.trim());
      setHealthStatus('ok');
    } catch (err: any) {
      setHealthMessage('Echec santé API');
      setErrorDetails(err?.message || 'Erreur inconnue');
      setHealthStatus('error');
    }
  };

  const runArticlesCheck = async () => {
    setArticlesStatus('loading');
    setErrorDetails(null);
    try {
      const res = await fetch(`${apiBase}/articles`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setArticlesCount(Array.isArray(data) ? data.length : null);
      setArticlesStatus('ok');
    } catch (err: any) {
      setArticlesStatus('error');
      setErrorDetails(err?.message || 'Erreur inconnue');
    }
  };

  const badge = (status: CheckStatus) => {
    switch (status) {
      case 'ok':
        return <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">OK</span>;
      case 'error':
        return <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800">Erreur</span>;
      case 'loading':
        return <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">En cours</span>;
      default:
        return <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-800">Idle</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Diagnostics</h1>
        <p className="text-slate-700 mb-6">
          Page interne pour vérifier l’API ({apiBase}) et les routes principales.
        </p>

        <div className="space-y-4">
          <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">API /health</h2>
                <p className="text-sm text-slate-600">Vérifie que le backend répond.</p>
              </div>
              {badge(healthStatus)}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={runHealthCheck}
                className="rounded-md bg-slate-900 px-3 py-2 text-white text-sm hover:bg-slate-800"
              >
                Relancer
              </button>
              <div className="text-sm text-slate-800">{healthMessage}</div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">API /articles</h2>
                <p className="text-sm text-slate-600">Retourne les articles publiés.</p>
              </div>
              {badge(articlesStatus)}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={runArticlesCheck}
                className="rounded-md bg-slate-900 px-3 py-2 text-white text-sm hover:bg-slate-800"
              >
                Tester la route
              </button>
              <div className="text-sm text-slate-800">
                {articlesCount !== null ? `${articlesCount} article(s)` : '–'}
              </div>
            </div>
          </div>

          {errorDetails && (
            <div className="rounded-lg bg-red-50 p-4 text-red-800 border border-red-200">
              {errorDetails}
            </div>
          )}

          <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
            <h2 className="text-xl font-semibold mb-2">Raccourcis utiles</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>
                <Link className="text-blue-600 hover:underline" to="/admin">
                  Accès admin
                </Link>
              </li>
              <li>
                <a className="text-blue-600 hover:underline" href={`${apiBase}/health`} target="_blank" rel="noreferrer">
                  API /health
                </a>
              </li>
              <li>
                <a className="text-blue-600 hover:underline" href={`${apiBase}/articles`} target="_blank" rel="noreferrer">
                  API /articles
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;
