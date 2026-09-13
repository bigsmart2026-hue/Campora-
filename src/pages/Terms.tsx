import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function Terms() {
  useDocumentTitle('Terms of Service');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Acceptance of Terms</h2>
            <p className="text-gray-600 dark:text-gray-400">
              By using Campora, you agree to these terms. If you don't agree, please don't use the platform.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Eligibility</h2>
            <p className="text-gray-600 dark:text-gray-400">
              You must be a verified student at a registered campus to use Campora. You must be at least 16 years old.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Seller Responsibilities</h2>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
              <li>List only accurate descriptions and images of items</li>
              <li>Respond to buyer inquiries promptly</li>
              <li>Complete deliveries as agreed</li>
              <li>Maintain a good reputation score</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Buyer Responsibilities</h2>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
              <li>Make payments through the platform only</li>
              <li>Confirm delivery with the provided PIN</li>
              <li>Inspect items upon delivery</li>
              <li>Leave honest reviews after transactions</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Prohibited Activities</h2>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
              <li>Selling counterfeit, stolen, or illegal items</li>
              <li>Circumventing platform fees</li>
              <li>Harassment or fraud</li>
              <li>Creating fake accounts</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Fees</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Campora charges a small commission on successful transactions. All fees are transparent and shown before checkout.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Dispute Resolution</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Disputes are reviewed by our team within 48 hours. Both parties can submit evidence. Our decision is final for platform-related matters.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Account Termination</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We may suspend or terminate accounts that violate these terms. You can delete your account at any time from settings.
            </p>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: September 2026</p>
        </div>
      </div>
    </div>
  );
}
