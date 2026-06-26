import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { KeyRound, Mail, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { signInWithSocial } = useAuth();
  const isRtl = i18n.language === 'ar';

  const [isLogin, setIsLogin] = useState<boolean>(true);
  
  // Forms state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        // Sign In
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        
        if (signInError) throw signInError;
        if (data?.user) {
          setSuccess(isRtl ? 'تم تسجيل الدخول بنجاح!' : 'Logged in successfully!');
          setTimeout(() => navigate('/'), 1000);
        }
      } else {
        // Sign Up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim()
            }
          }
        });

        if (signUpError) throw signUpError;
        
        if (data?.user) {
          setSuccess(isRtl ? 'تم إنشاء الحساب بنجاح! يرجى تأكيد بريدك الإلكتروني.' : 'Account created! Please check your email to verify.');
          // Auto create profile in DB just in case trigger is slow
          await supabase.from('profiles').insert({
            id: data.user.id,
            email: email.trim(),
            full_name: fullName.trim(),
            role_id: 1 // Default customer role
          });
        }
      }
    } catch (err: any) {
      setError(err.message || (isRtl ? 'فشلت العملية، يرجى المحاولة مرة أخرى.' : 'Authentication failed, try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      setError('');
      await signInWithSocial(provider);
    } catch (err: any) {
      setError(err.message || 'OAuth error occurred.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-6 bg-white dark:bg-zinc-900 border border-brand-sand/35 dark:border-zinc-800 rounded-2xl shadow-sm animate-fade-in font-sans">
      
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-brand-brown dark:text-brand-sand">
          {isLogin ? (isRtl ? 'مرحباً بعودتك' : 'Welcome Back') : (isRtl ? 'انضم إلى عائلتنا' : 'Join Our Collective')}
        </h1>
        <p className="text-xs text-brand-gray mt-1.5">
          {isLogin 
            ? (isRtl ? 'قم بتسجيل الدخول للوصول إلى تفاصيل طلباتك والمفضلة.' : 'Sign in to access your artisan orders & wishlists.') 
            : (isRtl ? 'أنشئ حساباً اليوم لتحصل على تجربة تسوق يدوية متكاملة.' : 'Create an account to track unique handmade pieces.')}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 p-3 rounded-lg border border-red-100 dark:border-red-900/30 text-xs flex items-center gap-2 mb-4">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 p-3 rounded-lg border border-green-100 dark:border-green-900/30 text-xs flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
        {!isLogin && (
          <Input
            label={isRtl ? 'الاسم بالكامل' : 'Full Name'}
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<User className="h-4 w-4 text-brand-brown/50" />}
          />
        )}

        <Input
          label={isRtl ? 'البريد الإلكتروني' : 'Email'}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="h-4 w-4 text-brand-brown/50" />}
        />

        <Input
          label={isRtl ? 'كلمة المرور' : 'Password'}
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<KeyRound className="h-4 w-4 text-brand-brown/50" />}
        />

        <Button
          type="submit"
          isLoading={loading}
          className="w-full mt-2 font-sans font-bold uppercase tracking-wider text-xs h-10"
        >
          {isLogin ? t('login') : t('register')}
        </Button>
      </form>

      {/* Social Logins */}
      <div className="flex flex-col gap-4 mt-6 border-t border-brand-sand/20 pt-6">
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-zinc-900 px-2 text-brand-gray tracking-wide">
            {isRtl ? 'أو الدفع السريع عبر' : 'Or connect with'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-semibold cursor-pointer"
            onClick={() => handleSocialLogin('google')}
          >
            Google
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-semibold cursor-pointer"
            onClick={() => handleSocialLogin('facebook')}
          >
            Facebook
          </Button>
        </div>
      </div>

      {/* Toggle View Link */}
      <p className="text-center text-xs text-brand-gray mt-6">
        {isLogin ? (isRtl ? 'ليس لديك حساب؟' : "Don't have an account?") : (isRtl ? 'تمتلك حساباً بالفعل؟' : 'Already have an account?')}
        <button
          onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
          className="text-brand-olive font-bold hover:underline cursor-pointer ml-1.5 mr-1.5"
        >
          {isLogin ? (isRtl ? 'سجل معنا الآن' : 'Create one') : (isRtl ? 'تسجيل الدخول' : 'Sign In')}
        </button>
      </p>
    </div>
  );
};
