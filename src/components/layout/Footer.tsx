import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, MapPin } from 'lucide-react';
import Logo from '@/components/common/Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gray-900 text-gray-400 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top section */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <Logo size="sm" showText={false} />
              <span className="text-xl font-bold text-white">Campora</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              The trusted campus marketplace. Buy and sell with confidence among verified students.
            </p>
            <div className="space-y-2">
              <a href="mailto:hello@campora.com" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-400 transition-colors">
                <Mail className="w-4 h-4" />
                hello@campora.com
              </a>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                Nigeria
              </div>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Marketplace</h3>
            <ul className="space-y-3">
              {[
                { to: '/products', label: 'Browse Products' },
                { to: '/sell', label: 'Start Selling' },
                { to: '/categories', label: 'Categories' },
                { to: '/deals', label: 'Hot Deals' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Trust & Safety</h3>
            <ul className="space-y-3">
              {[
                { to: '/verification', label: 'Student Verification' },
                { to: '/how-it-works', label: 'How It Works' },
                { to: '/safety', label: 'Safety Tips' },
                { to: '/trust-center', label: 'Trust Center' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Support</h3>
            <ul className="space-y-3">
              {[
                { to: '/help', label: 'Help Center' },
                { to: '/disputes', label: 'Report Issue' },
                { to: '/contact', label: 'Contact Us' },
                { to: '/faq', label: 'FAQ' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="py-10 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-white font-semibold text-lg">Stay in the loop</h4>
              <p className="text-sm text-gray-400 mt-1">Get the latest deals and updates from your campus marketplace.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-72 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all duration-200"
                aria-label="Email for newsletter"
              />
              <button className="btn-primary px-6 py-2.5 text-sm whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="py-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} Campora. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-gray-500 hover:text-white transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-white transition-colors duration-200">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-gray-500 hover:text-white transition-colors duration-200">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
