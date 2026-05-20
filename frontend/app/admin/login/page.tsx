'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Watch, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const { t } = useLang();
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      router.push('/admin');
    } catch (err) {
      setError((err as Error).message || t.admin.wrongPassword);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-bright))', boxShadow: 'var(--shadow-gold)' }}>
            <Watch size={24} color="#0A0A0A" />
          </div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {t.admin.loginTitle}
          </h1>
          <p className="text-sm mt-1 gold-text font-semibold tracking-widest uppercase">
            {t.admin.loginSubtitle}
          </p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: 'var(--text-muted)' }}>
                {t.admin.username}
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-luxury pl-9"
                  placeholder="admin"
                  autoFocus
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: 'var(--text-muted)' }}>
                {t.admin.password}
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-luxury pl-9 pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-subtle)' }}
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            </div>

            <button type="submit" disabled={loading} className="gold-btn w-full justify-center">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ...
                </span>
              ) : t.admin.loginBtn}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
