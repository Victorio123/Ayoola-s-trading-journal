import { useState, FormEvent } from 'react';
import { Sparkles, ShieldCheck, Activity, Chrome, LogIn, Mail, User, Lock } from 'lucide-react';

interface GoogleLoginProps {
  onSuccess: (user: { email: string; name: string; avatar: string }) => void;
  defaultEmail?: string;
}

export default function GoogleLogin({ onSuccess, defaultEmail = 'toolaoilqbi@gmail.com' }: GoogleLoginProps) {
  const [step, setStep] = useState<'intro' | 'chooser' | 'loading'>('intro');
  const [selectedEmail, setSelectedEmail] = useState<string>('');
  const [customEmail, setCustomEmail] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [authProgress, setAuthProgress] = useState<string>('');

  // Form states for manual SignUp / Login
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [formEmail, setFormEmail] = useState<string>('');
  const [formName, setFormName] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Generate simulated user initials
  const getInitials = (email: string) => {
    const parts = email.split('@')[0];
    return parts.substring(0, 2).toUpperCase();
  };

  const startLoginFlow = () => {
    setStep('chooser');
  };

  const handleSelectAccount = (email: string) => {
    setSelectedEmail(email);
    setStep('loading');
    animateLoading(email);
  };

  const handleCustomEmailSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) return;
    setSelectedEmail(customEmail);
    setStep('loading');
    animateLoading(customEmail);
  };

  const handleManualFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formEmail || !formEmail.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (isRegisterMode && !formName.trim()) {
      setFormError('Please enter your display name.');
      return;
    }
    setFormError('');
    setSelectedEmail(formEmail);
    setStep('loading');
    animateLoading(formEmail, formName.trim() || undefined);
  };

  const animateLoading = (email: string, customName?: string) => {
    const statuses = [
      'Establishing secure token handshake...',
      'Validating client credentials...',
      'Partitioning local browser isolated trading databases...',
      'Syncing psychology neural modules...',
      'Session validated successfully. Accessing journal...'
    ];

    let current = 0;
    setAuthProgress(statuses[0]);

    const interval = setInterval(() => {
      current++;
      if (current < statuses.length) {
        setAuthProgress(statuses[current]);
      } else {
        clearInterval(interval);
        // Successful mock OAuth authentication
        const namePart = email.split('@')[0];
        const formattedName = customName || (namePart.charAt(0).toUpperCase() + namePart.slice(1));
        onSuccess({
          email: email,
          name: formattedName,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${namePart}&backgroundColor=10b981&textColor=09090b`
        });
      }
    }, 800);
  };

  return (
    <div id="google-login-container" className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden select-none selection:bg-emerald-500 selection:text-zinc-950">
      
      {/* Dynamic ambient lights backdrop */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] bg-zinc-500/5 blur-[90px] rounded-full pointer-events-none" />

      {/* Main card panel */}
      <div id="login-card-panel" className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative z-10 shadow-2xl shadow-emerald-950/10">
        
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-3xl bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

        {step === 'intro' && (
          <div className="flex flex-col items-center relative z-10">
            {/* Logo */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-zinc-950 flex items-center justify-center mb-5 shadow-xl shadow-emerald-500/10">
              <Activity size={28} className="stroke-[2.5]" />
            </div>

            <h1 className="text-2xl font-black font-display tracking-tight text-white mb-1.5 uppercase text-center">
              JOURNALY
            </h1>
            <p className="text-zinc-400 text-xs mb-6 max-w-sm text-center">
              Your professional, high-fidelity cognitive psychology trading companion. Monitor performance, review trends, and refine emotional biases.
            </p>

            {/* Google branded authenticate button */}
            <button
              onClick={startLoginFlow}
              id="google-authenticate-btn"
              className="w-full bg-white text-zinc-950 hover:bg-zinc-100 active:scale-[0.99] font-bold text-xs h-11 rounded-xl flex items-center justify-center px-4 transition-all duration-200 cursor-pointer shadow-lg shadow-white/5 border border-zinc-200"
            >
              {/* Perfect Google vector logo G */}
              <svg className="w-4.5 h-4.5 mr-2.5 shrink-0" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Seamless Visual Separator */}
            <div className="w-full flex items-center my-5">
              <div className="flex-1 border-t border-zinc-800"></div>
              <span className="px-3 text-[10px] uppercase font-bold tracking-widest text-zinc-550 text-zinc-500 bg-zinc-900">or sign up / login below</span>
              <div className="flex-1 border-t border-zinc-800"></div>
            </div>

            {/* Direct manual signup or login form */}
            <form onSubmit={handleManualFormSubmit} className="w-full space-y-3">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-medium text-center">
                  {formError}
                </div>
              )}

              {/* Show display name only if Register mode is active */}
              {isRegisterMode && (
                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block px-1">Display Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-650 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 pr-10"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                    <div className="absolute right-3 top-3 text-zinc-650 text-zinc-500">
                      <User size={13} />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block px-1">Email address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-650 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 pr-10"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                  <div className="absolute right-3 top-3 text-zinc-650 text-zinc-500">
                    <Mail size={13} />
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block px-1">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-650 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 pr-10"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                  />
                  <div className="absolute right-3 top-3 text-zinc-650 text-zinc-500">
                    <Lock size={13} />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-450 hover:bg-emerald-400 font-bold text-xs h-11 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-[0.99]"
              >
                <LogIn size={14} className="stroke-[2.5]" />
                <span>{isRegisterMode ? 'Create Account & Start' : 'Access Trading Journal'}</span>
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs">
              <span className="text-zinc-500">
                {isRegisterMode ? 'Already have an account?' : 'New to Journaly?'}
              </span>
              <button
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setFormError('');
                }}
                className="text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                {isRegisterMode ? 'Log In' : 'Sign Up'}
              </button>
            </div>

            {/* Alternate bypass option */}
            <button
              onClick={() => handleSelectAccount('guest@journaly.local')}
              className="mt-3 text-[11px] font-semibold text-zinc-550 text-zinc-500 hover:text-zinc-300 transition-colors py-1 px-4 cursor-pointer"
            >
              Continue as Local Guest (No account sync)
            </button>

            <div className="mt-8 w-full pt-4 border-t border-zinc-800/40 flex items-center justify-center gap-2 text-[10px] text-zinc-600">
              <ShieldCheck size={14} className="text-emerald-500/60" />
              <span>Secure isolated local workspace protocol active.</span>
            </div>
          </div>
        )}

        {step === 'chooser' && (
          <div className="flex flex-col relative z-10 animate-fade-in">
            <div className="flex items-center gap-2 mb-6 border-b border-zinc-800/60 pb-4">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <h2 className="text-sm font-bold tracking-tight text-white uppercase">
                Sign in with Google
              </h2>
            </div>

            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Select an account to proceed to Journaly. This initializes a private client-side partition matching your email ID.
            </p>

            <div className="space-y-3 mb-6" id="google-account-list">
              {/* Option A: Prefilled personalized */}
              <button
                onClick={() => handleSelectAccount(defaultEmail)}
                className="w-full flex items-center justify-between p-3.5 bg-zinc-850/40 hover:bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 rounded-2xl text-left transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold font-display text-sm tracking-tighter">
                    {getInitials(defaultEmail)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-100 block">
                      {defaultEmail.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      {defaultEmail}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded-full">
                  Active
                </div>
              </button>

              {/* Option B: Standard Guest mockup */}
              <button
                onClick={() => handleSelectAccount('alpha.trader@gmail.com')}
                className="w-full flex items-center justify-between p-3.5 bg-zinc-950/20 hover:bg-zinc-800/40 border border-zinc-900 hover:border-zinc-850 rounded-2xl text-left transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-755/30 text-zinc-350 flex items-center justify-center font-bold font-display text-sm">
                    AT
                  </div>
                  <div>
                    <span className="text-xs font-bold text-zinc-100 block">Alpha Trader</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">alpha.trader@gmail.com</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Custom email accordion */}
            {!showCustomInput ? (
              <button
                onClick={() => setShowCustomInput(true)}
                className="text-xs font-bold text-emerald-450 hover:text-emerald-400 transition-colors text-center py-2 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Mail size={12} />
                <span>Sign in with another Google Account</span>
              </button>
            ) : (
              <form onSubmit={handleCustomEmailSubmit} className="space-y-3 animate-fade-in mt-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter Google Account Email..."
                    className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 pr-10"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                  />
                  <div className="absolute right-3 top-3 text-zinc-500">
                    <Chrome size={14} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-550 hover:bg-emerald-500 bg-emerald-500 text-zinc-950 font-bold text-xs h-10 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <LogIn size={13} />
                    <span>Authorize</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs h-10 px-4 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <button
              onClick={() => setStep('intro')}
              className="mt-8 text-[11px] font-bold text-zinc-500 hover:text-zinc-400 transition-colors self-center py-1 cursor-pointer"
            >
              &larr; Back to login intro
            </button>
          </div>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center text-center py-6 relative z-10 animate-pulse duration-[20000ms]">
            <div className="relative mb-6">
              {/* Spinning visual core */}
              <div className="w-16 h-16 rounded-full border-t-2 border-r-2 border-emerald-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                <Sparkles size={18} className="animate-pulse" />
              </div>
            </div>

            <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 font-display">
              Google Authentification
            </h3>
            
            <p className="text-[11px] text-zinc-400 mt-4 leading-relaxed max-w-xs font-mono select-none" id="auth-status-log">
              {authProgress}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
