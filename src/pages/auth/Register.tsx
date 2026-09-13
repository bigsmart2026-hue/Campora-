import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Zap, ChevronDown, MapPin } from 'lucide-react';
import { registerWithEmail, loginWithGoogle } from '@/services/authService';
import toast from 'react-hot-toast';
import Logo from '@/components/common/Logo';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    campus: z.string().min(1, 'Please select your campus'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      ),
    confirmPassword: z.string(),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to the terms' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const CAMPUSES = [
  { name: 'FUTO', label: 'Federal University of Technology, Owerri' },
  { name: 'FUPRE', label: 'Federal University of Petroleum Resources' },
  { name: 'IMSU', label: 'Imo State University' },
  { name: 'MOUAU', label: 'Michael Okpara University of Agriculture' },
  { name: 'UNIPORT', label: 'University of Port Harcourt' },
  { name: 'RSUST', label: 'Rivers State University' },
  { name: 'OAU', label: 'Obafemi Awolowo University' },
  { name: 'UNILAG', label: 'University of Lagos' },
  { name: 'ABU', label: 'Ahmadu Bello University' },
  { name: 'OUI', label: 'Open University Nigeria' },
];

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const selectedCampus = watch('campus');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerWithEmail(data.email, data.password, data.fullName, data.campus);
      toast.success('Account created! Please verify your email.');
      navigate('/verify-email');
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const err = error as { code?: string; message?: string };
      let message = 'Failed to create account. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (err.message) {
        message = err.message;
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Welcome to Campora!');
      navigate('/');
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.message === 'Account has been deactivated. Please contact support.') {
        toast.error(err.message);
      } else if (err.code !== 'auth/popup-closed-by-user') {
        toast.error('Failed to signup with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Join your campus<br />marketplace
          </h1>
          <p className="text-primary-100 text-lg leading-relaxed max-w-md">
            Create your account and start buying and selling with fellow students at {selectedCampus || 'your campus'}.
          </p>
          <div className="mt-12 space-y-4">
            {CAMPUSES.slice(0, 4).map((campus) => (
              <div key={campus.name} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedCampus === campus.name ? 'bg-white text-primary-600' : 'bg-white/20'}`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <span className={`text-sm ${selectedCampus === campus.name ? 'text-white font-medium' : 'text-primary-200'}`}>
                  {campus.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center py-10 sm:px-6 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="flex justify-center lg:justify-start mb-6">
            <Logo size="md" showText={false} />
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mx-auto w-full max-w-md mt-6">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="fullName" className="label">Full Name</label>
              <input
                {...register('fullName')}
                id="fullName"
                type="text"
                autoComplete="name"
                className="input-field"
                placeholder="John Doe"
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                className="input-field"
                placeholder="you@campus.edu"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="campus" className="label">Campus</label>
              <div className="relative">
                <select
                  {...register('campus')}
                  id="campus"
                  defaultValue=""
                  className="input-field appearance-none pr-10"
                >
                  <option value="" disabled>Select your campus</option>
                  {CAMPUSES.map((campus) => (
                    <option key={campus.name} value={campus.name}>
                      {campus.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.campus && <p className="mt-1 text-sm text-red-600">{errors.campus.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" /> : <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">Confirm Password</label>
              <input
                {...register('confirmPassword')}
                id="confirmPassword"
                type="password"
                className="input-field"
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-start">
              <input
                {...register('agreeToTerms')}
                id="agree-terms"
                type="checkbox"
                className="h-4 w-4 mt-0.5 text-primary-600 dark:text-primary-400 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:text-primary-500">Terms of Service</Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:text-primary-500">Privacy Policy</Link>
              </label>
            </div>
            {errors.agreeToTerms && <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>}

            <button type="submit" disabled={isLoading} className="w-full btn-primary py-3">
              {isLoading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="mt-4 w-full btn-secondary py-3"
            >
              <Zap className="w-5 h-5 mr-2" />
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
