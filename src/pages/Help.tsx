import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const faqs = [
  {
    question: 'How do I create an account?',
    answer: 'Click "Sign Up" on the homepage, enter your details, select your campus, and verify your email. You can also sign up with Google.',
  },
  {
    question: 'How do I verify my student status?',
    answer: 'Go to Profile → Verification tab and submit a photo of your student ID or campus registration document. Verification usually takes 24-48 hours.',
  },
  {
    question: 'How does payment work?',
    answer: 'We use Paystack for secure payments. When you buy an item, your payment is held in escrow until you confirm delivery with your PIN.',
  },
  {
    question: 'What is the delivery PIN system?',
    answer: 'After purchase, a unique 6-digit PIN is generated. The runner delivers the item, and you provide the PIN to confirm you received it.',
  },
  {
    question: 'How do I become a delivery runner?',
    answer: 'Go to Runner Registration, fill in your details, and submit. After approval, you can start accepting delivery requests.',
  },
  {
    question: 'What if I have a dispute?',
    answer: 'Go to the order details page and click "File Dispute". Provide evidence and our team will review and resolve it within 48 hours.',
  },
  {
    question: 'Can I return an item?',
    answer: "Returns depend on the seller's policy. If the item is not as described, file a dispute and we'll help resolve it.",
  },
  {
    question: 'How do I contact support?',
    answer: 'Visit our Contact page or email support@campora.ng. We respond within 24 hours.',
  },
];

export default function Help() {
  useDocumentTitle('Help Center');
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Help Center</h1>
          <p className="text-gray-500 dark:text-gray-400">Find answers to common questions</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No matching questions</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              We couldn't find any questions matching "{search}"
            </p>
            <button
              type="button"
              onClick={() => setSearch('')}
              className="btn-secondary"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between"
                >
                  <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
