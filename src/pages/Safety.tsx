import { Shield, AlertTriangle, CheckCircle, Eye, Lock, MapPin } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const tips = [
  {
    icon: CheckCircle,
    title: 'Verify Before You Buy',
    description: 'Always check the seller\'s verification badge and reviews before making a purchase.',
    color: 'text-green-600 bg-green-100',
  },
  {
    icon: MapPin,
    title: 'Meet on Campus',
    description: 'Always meet in public campus locations. Never go to isolated areas for transactions.',
    color: 'text-primary-600 bg-primary-100',
  },
  {
    icon: Lock,
    title: 'Use Secure Payment',
    description: 'Never pay outside the platform. Use Paystack for secure, tracked transactions.',
    color: 'text-purple-600 bg-purple-100',
  },
  {
    icon: Eye,
    title: 'Request Inspection',
    description: 'For high-value items, request a professional inspection before buying.',
    color: 'text-yellow-600 bg-yellow-100',
  },
  {
    icon: AlertTriangle,
    title: 'Report Suspicious Activity',
    description: 'If something feels off, report it immediately. We take all reports seriously.',
    color: 'text-red-600 bg-red-100',
  },
  {
    icon: Shield,
    title: 'Use the PIN System',
    description: 'Always use the delivery PIN system. Never share your PIN until you receive the item.',
    color: 'text-indigo-600 bg-indigo-100',
  },
];

export default function Safety() {
  useDocumentTitle('Safety Tips');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Safety Tips</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Your safety is our priority. Follow these tips to stay safe on Campora.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${tip.color}`}>
                <tip.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{tip.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{tip.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
