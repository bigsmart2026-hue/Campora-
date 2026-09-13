import { Link } from 'react-router-dom';
import { AlertTriangle, FileText, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Disputes() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Disputes</h1>
          <p className="text-gray-500 dark:text-gray-400">Having an issue with an order? We're here to help.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">How to File a Dispute</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Go to your order</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Navigate to Orders and find the order you want to dispute</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Click "File Dispute"</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Select the reason and provide a description of the issue</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Upload evidence</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Attach photos or screenshots to support your case</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">4</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Wait for resolution</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Our team reviews disputes within 48 hours</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <FileText className="w-8 h-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">Evidence</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Upload photos & docs</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">48hrs</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg. resolution time</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">Fair</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Impartial review</p>
          </div>
        </div>

        {user ? (
          <div className="text-center">
            <Link to="/orders" className="btn-primary inline-flex items-center">
              Go to My Orders
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <Link to="/login" className="btn-primary inline-flex items-center">
              Login to View Orders
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
