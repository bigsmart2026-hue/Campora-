import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function Privacy() {
  useDocumentTitle('Privacy Policy');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Information We Collect</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We collect information you provide directly, including your name, email, phone number, campus, and student ID for verification purposes. We also collect transaction data and communications between users.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
              <li>To verify your student status and maintain platform trust</li>
              <li>To process transactions and deliveries</li>
              <li>To communicate about orders, disputes, and platform updates</li>
              <li>To improve our services and user experience</li>
              <li>To prevent fraud and ensure platform safety</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Data Security</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We use Firebase security rules, encryption, and industry-standard security measures to protect your data. Payment information is processed securely through Paystack and is never stored on our servers.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Data Sharing</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We do not sell your personal information. We may share data with delivery runners (limited to delivery details), payment processors (for transactions), and law enforcement (when legally required).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your Rights</h2>
            <p className="text-gray-600 dark:text-gray-400">
              You can access, update, or delete your account data at any time from your profile settings. For data deletion requests, contact support@campora.ng.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contact</h2>
            <p className="text-gray-600 dark:text-gray-400">
              For privacy-related questions, email us at support@campora.ng.
            </p>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: September 2026</p>
        </div>
      </div>
    </div>
  );
}
