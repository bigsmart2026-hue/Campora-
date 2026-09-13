import { useState, useEffect } from 'react';
import {
  Shield,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  submitVerification,
  getUserVerifications,
} from '@/services/verificationService';
import { Verification as VerificationData } from '@/types';
import toast from 'react-hot-toast';

type VerificationType = 'campus_id' | 'student_id' | 'seller';

const VERIFICATION_TYPES = [
  {
    type: 'campus_id' as VerificationType,
    title: 'Campus Verification',
    description: 'Verify you are a student at your campus',
    icon: Shield,
    requirements: [
      'Clear photo of your student ID card',
      'Both sides must be visible',
      'Name must match your account',
    ],
  },
  {
    type: 'student_id' as VerificationType,
    title: 'Student ID Verification',
    description: 'Additional verification for higher trust',
    icon: FileText,
    requirements: [
      'Clear photo of your student ID',
      'Registration document or admission letter',
      'Must show current academic year',
    ],
  },
  {
    type: 'seller' as VerificationType,
    title: 'Seller Verification',
    description: 'Become a verified seller with enhanced features',
    icon: Shield,
    requirements: [
      'Valid government-issued ID',
      'Student ID card',
      'Phone number verification',
    ],
  },
];

export default function Verification() {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<VerificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<VerificationType | null>(null);
  const [documents, setDocuments] = useState<File[]>([]);
  const [documentPreviews, setDocumentPreviews] = useState<string[]>([]);

  useEffect(() => {
    async function loadVerifications() {
      if (!user) return;

      try {
        const userVerifications = await getUserVerifications(user.id);
        setVerifications(userVerifications);
      } catch (error) {
        console.error('Error loading verifications:', error);
      } finally {
        setLoading(false);
      }
    }

    loadVerifications();
  }, [user]);

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (documents.length + files.length > 3) {
      toast.error('Maximum 3 documents allowed');
      return;
    }

    setDocuments((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentPreviews((prev) => [
          ...prev,
          (e.target?.result as string) || '',
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
    setDocumentPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user || !selectedType || documents.length === 0) {
      toast.error('Please select documents to upload');
      return;
    }

    setSubmitting(true);

    try {
      await submitVerification(user.id, selectedType, documents);
      toast.success('Verification submitted! We will review it shortly.');

      // Refresh verifications
      const updatedVerifications = await getUserVerifications(user.id);
      setVerifications(updatedVerifications);

      // Reset form
      setSelectedType(null);
      setDocuments([]);
      setDocumentPreviews([]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit verification');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: VerificationData['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: VerificationData['status']) => {
    switch (status) {
      case 'approved':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'rejected':
        return 'badge-error';
      default:
        return 'badge-info';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Verification Center
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Verify your identity to build trust and unlock features
        </p>

        {/* Current Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Your Verification Status
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  user?.isCampusVerified ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                {user?.isCampusVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">1</span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Campus</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.isCampusVerified ? 'Verified' : 'Not verified'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  user?.isIdVerified ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                {user?.isIdVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">2</span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Student ID</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.isIdVerified ? 'Verified' : 'Not verified'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  user?.isIdVerified ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                {user?.isIdVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">3</span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Seller</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.isIdVerified ? 'Verified' : 'Not verified'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {VERIFICATION_TYPES.map((vType) => {
            const existingVerification = verifications.find(
              (v) => v.type === vType.type
            );
            const Icon = vType.icon;

            return (
              <div
                key={vType.type}
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-2 transition-all cursor-pointer ${
                  selectedType === vType.type
                    ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-900/50'
                    : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                } ${
                  existingVerification?.status === 'approved'
                    ? 'opacity-75'
                    : ''
                }`}
                onClick={() => {
                  if (existingVerification?.status !== 'approved') {
                    setSelectedType(vType.type);
                  }
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  {existingVerification && (
                    <div className="flex items-center gap-2">
                      {getStatusIcon(existingVerification.status)}
                      <span
                        className={`badge ${getStatusColor(
                          existingVerification.status
                        )}`}
                      >
                        {existingVerification.status}
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {vType.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{vType.description}</p>

                <ul className="space-y-2">
                  {vType.requirements.map((req, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <AlertCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Upload Section */}
        {selectedType && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Upload Documents
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {documentPreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
                  >
                    {preview.startsWith('data:image') ? (
                      <img
                        src={preview}
                        alt={`Document ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <XCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                ))}

                {documents.length < 3 && (
                  <label className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Add Document</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleDocumentSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || documents.length === 0}
                className="w-full btn-primary py-3"
              >
                {submitting ? (
                  <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  'Submit for Review'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Previous Submissions */}
        {verifications.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Previous Submissions
            </h2>

            <div className="space-y-4">
              {verifications.map((verification) => (
                <div
                  key={verification.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(verification.status)}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {verification.type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Submitted{' '}
                        {new Date(
                          verification.submittedAt as unknown as string
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${getStatusColor(verification.status)}`}>
                    {verification.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
