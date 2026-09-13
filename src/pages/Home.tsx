import { Link } from 'react-router-dom';
import { Shield, Truck, Star, ArrowRight, CheckCircle, TrendingUp, Users, Package, Zap } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getRecentProducts } from '@/services/productService';
import { getCategories } from '@/services/categoryService';
import { Product, Category } from '@/types';
import ProductCard from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/common/Skeleton';
import { getCategoryIcon } from '@/utils/categoryIcons';
import Logo from '@/components/common/Logo';

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let start = 0;
          const increment = target / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function StatCounter({ target, label, icon: Icon, suffix = '+' }: { target: number; label: string; icon: React.ComponentType<{ className?: string }>; suffix?: string }) {
  const { count, ref } = useCountUp(target);

  return (
    <div ref={ref} className="text-center group">
      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{label}</div>
    </div>
  );
}

const SOLID_COLORS: Record<string, string> = {
  electronics: 'bg-blue-500',
  books: 'bg-amber-500',
  furniture: 'bg-emerald-500',
  clothing: 'bg-violet-500',
  sports: 'bg-rose-500',
  gaming: 'bg-indigo-500',
  beauty: 'bg-pink-500',
  kitchen: 'bg-teal-500',
  music: 'bg-fuchsia-500',
  services: 'bg-slate-500',
  other: 'bg-gray-500',
};

export default function Home() {
  const { user } = useAuth();
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [products, cats] = await Promise.all([
          user?.campus ? getRecentProducts(user.campus, 8) : Promise.resolve([]),
          getCategories(),
        ]);
        setRecentProducts(products);
        setCategories(cats);
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.campus]);

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-200/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-100/20 rounded-full blur-3xl" />
        </div>

        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
          backgroundImage: `radial-gradient(circle, #10b981 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-400 text-sm font-semibold mb-6">
                <Zap className="w-4 h-4" />
                Trusted by students across Nigeria
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white tracking-tight leading-[1.08] mb-6">
                Buy & Sell on{' '}
                <span className="relative inline-block">
                  <span className="text-primary-600 dark:text-primary-400">Campus</span>
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-primary-500 rounded-full" />
                </span>
                <br />With Confidence
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-lg mb-10 leading-relaxed">
                Verified sellers, inspected products, and protected transactions.
                The marketplace your campus actually trusts.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-primary text-base px-8 py-4 group">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/products" className="btn-secondary text-base px-8 py-4">
                  Browse Products
                </Link>
              </div>

              <div className="flex items-center gap-6 mt-10 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary-500" />
                  Free to list
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary-500" />
                  Secure payments
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary-500" />
                  Campus delivery
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block animate-fade-in animate-delay-300">
              <img src="/logo.png" alt="Campora" className="w-full max-w-sm mx-auto drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCounter target={500} label="Active Students" icon={Users} />
            <StatCounter target={2000} label="Products Listed" icon={Package} />
            <StatCounter target={800} label="Successful Trades" icon={TrendingUp} />
            <StatCounter target={4.8} label="Avg. Rating" icon={Star} suffix="/5" />
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-400 text-sm font-semibold mb-4">
              <Shield className="w-4 h-4" />
              Why Students Trust Us
            </span>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Built on Trust, Not Guesswork
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Every feature is designed to turn claims into verifiable evidence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Verified Sellers',
                description: 'Every seller is verified with their student ID. Know exactly who you\'re buying from.',
                color: 'bg-emerald-500',
                bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconColor: 'text-emerald-600 dark:text-emerald-400',
                features: ['Student ID verification', 'Campus confirmation', 'Reputation tracking'],
              },
              {
                icon: Star,
                title: 'Inspected Products',
                description: 'High-value items can be inspected to verify quality and authenticity before you buy.',
                color: 'bg-primary-500',
                bgColor: 'bg-primary-50 dark:bg-primary-900/20',
                iconColor: 'text-primary-600 dark:text-primary-400',
                features: ['Quality verification', 'Photo evidence', 'Trust scoring'],
              },
              {
                icon: Truck,
                title: 'Secure Delivery',
                description: 'Verified runners deliver your purchases with GPS tracking and PIN confirmation.',
                color: 'bg-violet-500',
                bgColor: 'bg-violet-50 dark:bg-violet-900/20',
                iconColor: 'text-violet-600 dark:text-violet-400',
                features: ['Verified runners', 'GPS tracking', 'Delivery PIN'],
              },
            ].map((feature, index) => (
              <div key={index} className="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-500 hover:shadow-soft-lg dark:hover:shadow-gray-900/50">
                <div className={`absolute top-0 left-8 right-8 h-1 ${feature.color} rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className={`w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className={`w-5 h-5 rounded-full ${feature.color} flex items-center justify-center flex-shrink-0`}>
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Quick Steps */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-50 dark:bg-accent-900/30 rounded-full text-accent-700 dark:text-accent-400 text-sm font-semibold mb-4">
              Simple Process
            </span>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Start in 3 Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-primary-200 dark:bg-primary-800" />

            {[
              { step: '1', title: 'Sign Up', desc: 'Create your free account with your campus email', color: 'bg-primary-500' },
              { step: '2', title: 'List or Browse', desc: 'Sell your items or find what you need on campus', color: 'bg-violet-500' },
              { step: '3', title: 'Transact Safely', desc: 'Pay securely and get campus delivery', color: 'bg-emerald-500' },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className={`w-12 h-12 rounded-full ${item.color} text-white font-bold text-lg flex items-center justify-center mx-auto mb-4 relative z-10 shadow-lg`}>
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-50 dark:bg-accent-900/30 rounded-full text-accent-700 dark:text-accent-400 text-sm font-semibold mb-4">
                  Explore
                </span>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Browse by Category</h2>
              </div>
              <Link to="/categories" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold flex items-center gap-1 group">
                View All
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.slice(0, 10).map((category) => {
                const Icon = getCategoryIcon(category.icon);
                return (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.slug}`}
                    className="group relative bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 text-center transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1"
                  >
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl ${SOLID_COLORS[category.slug] || 'bg-gray-500'} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{category.name}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Recent Listings */}
      {recentProducts.length > 0 && (
        <section className="py-24 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-400 text-sm font-semibold mb-4">
                  Fresh Arrivals
                </span>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Recent Listings</h2>
              </div>
              <Link to="/products" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold flex items-center gap-1 group">
                View All
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))
                : recentProducts.map((product, index) => (
                    <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
                      <ProductCard product={product} />
                    </div>
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-600" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Join Your Campus Marketplace?
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Join students already buying and selling with confidence. It's free to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-10 py-4 text-lg font-bold rounded-xl text-primary-700 bg-white hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
            >
              Create Free Account
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center px-10 py-4 text-lg font-semibold rounded-xl text-white border-2 border-white/30 hover:border-white/50 hover:bg-white/10 transition-all duration-300"
            >
              Learn How It Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
