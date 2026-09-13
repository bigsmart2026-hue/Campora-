import { Shield, Search, Truck, CheckCircle, Star, ArrowRight, Users, Zap, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    number: '01',
    icon: Shield,
    title: 'Verify Your Identity',
    description: 'Sign up with your campus email and verify your student ID. This ensures only real students can buy and sell on the platform.',
    bgColor: 'bg-emerald-50',
    solidColor: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    detail: 'Student ID + Campus Email',
  },
  {
    number: '02',
    icon: Search,
    title: 'Browse or List Products',
    description: 'Search for items you need or list your own products with photos, descriptions, and prices. Set your campus and condition.',
    bgColor: 'bg-primary-50',
    solidColor: 'bg-primary-500',
    textColor: 'text-primary-600',
    detail: 'Smart Search & Filters',
  },
  {
    number: '03',
    icon: Star,
    title: 'Trust & Inspect',
    description: 'Every product has a trust score. Request an inspection before buying for complete peace of mind on high-value items.',
    bgColor: 'bg-violet-50',
    solidColor: 'bg-violet-500',
    textColor: 'text-violet-600',
    detail: 'Quality Verification',
  },
  {
    number: '04',
    icon: Lock,
    title: 'Secure Payment',
    description: 'Pay securely through Paystack with escrow protection. Your money is held safely until you confirm delivery.',
    bgColor: 'bg-amber-50',
    solidColor: 'bg-amber-500',
    textColor: 'text-amber-600',
    detail: 'Escrow Protected',
  },
  {
    number: '05',
    icon: Truck,
    title: 'Campus Delivery',
    description: 'A verified runner delivers your item across campus. Track the delivery in real-time and get a unique PIN for confirmation.',
    bgColor: 'bg-rose-50',
    solidColor: 'bg-rose-500',
    textColor: 'text-rose-600',
    detail: 'Real-time Tracking',
  },
  {
    number: '06',
    icon: CheckCircle,
    title: 'Confirm & Rate',
    description: 'Confirm delivery with your PIN, inspect the item, and leave a review. Help build trust in the community.',
    bgColor: 'bg-cyan-50',
    solidColor: 'bg-cyan-500',
    textColor: 'text-cyan-600',
    detail: 'PIN Confirmation',
  },
];

const features = [
  {
    icon: Users,
    title: 'Campus-Only Community',
    description: 'Only verified students can access the marketplace.',
  },
  {
    icon: Zap,
    title: 'Instant Notifications',
    description: 'Get alerted when someone buys, messages, or reviews.',
  },
  {
    icon: Lock,
    title: 'Escrow Protection',
    description: 'Your money is safe until you confirm delivery.',
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-primary-50 dark:bg-gray-900" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-violet-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-300 text-sm font-semibold mb-6 border border-primary-100 dark:border-primary-800">
            <Zap className="w-4 h-4" />
            Simple & Secure
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            How <span className="gradient-text">Campora</span> Works
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            From browsing to delivery, every step is designed for trust and security. 
            Here's how we make campus trading safe.
          </p>
        </div>
      </section>

      {/* Steps Timeline */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-primary-200 dark:bg-primary-800 hidden md:block" />

            <div className="space-y-16 md:space-y-24">
              {steps.map((step, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div
                    key={index}
                    className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 ${
                      isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    {/* Content */}
                    <div className={`flex-1 ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                      <div className={`bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-soft hover:shadow-soft-lg transition-all duration-500 group ${
                        isEven ? 'md:mr-16' : 'md:ml-16'
                      }`}>
                        <div className={`flex items-center gap-4 mb-4 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                          <span className={`text-4xl font-black ${step.textColor}`}>
                            {step.number}
                          </span>
                          <div className={`w-12 h-12 ${step.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <step.icon className="w-6 h-6 text-emerald-600" />
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{step.description}</p>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${step.bgColor} rounded-lg text-xs font-semibold ${step.textColor}`}>
                          {step.detail}
                        </div>
                      </div>
                    </div>

                    {/* Center node */}
                    <div className="relative z-10 hidden md:flex">
                      <div className={`w-16 h-16 rounded-full ${step.solidColor} flex items-center justify-center shadow-lg`}>
                        <span className="text-white font-bold text-lg">{step.number}</span>
                      </div>
                    </div>

                    {/* Spacer for alignment */}
                    <div className="flex-1 hidden md:block" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Built for Students, by Students</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Every feature is designed with campus life in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 text-center hover:shadow-soft-lg transition-all duration-500 group"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-primary-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10">
            Join thousands of students already buying and selling with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base px-8 py-4 group">
              Create Free Account
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/products" className="btn-secondary text-base px-8 py-4">
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
