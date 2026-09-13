import { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Eye,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  getPendingVerifications,
  approveVerification,
  rejectVerification,
} from '@/services/verificationService';
import { Verification } from '@/types';
import toast from 'react-hot-toast';

export default function AdminVerifications() {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedVerification, setSelectedVerification] =
    useState<Verification | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    loadVerifications();
  }, []);

  async function loadVerifications() {
    try {
      const pending = await getPendingVerifications();
      setVerifications(pending);
    } catch (error) {
      console.error('Error loading verifications:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (verificationId: string) => {
    if (!user) return;

    setProcessing(verificationId);
    try {
      await approveVerification(verificationId, user.id);
      toast.success('Verification approved');
      await loadVerifications();
    } catch (error) {
      toast.error('Failed to approve verification');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!user || !selectedVerification || !rejectReason.trim()) return;

    setProcessing(selectedVerification.id);
    try {
      await rejectVerification(selectedVerification.id, user.id, rejectReason);
      toast.success('Verification rejected');
      setShowRejectModal(false);
      setSelectedVerification(null);
      setRejectReason('');
      await loadVerifications();
    } catch (error) {
      toast.error('Failed to reject verification');
    } finally {
      setProcessing(null);
    }
  };

  const getTypeLabel = (type: Verification['type']) => {
    switch (type) {
      case 'campus_id':
        return 'Campus ID';
      case 'student_id':
        return 'Student ID';
      case 'seller':
        return 'Seller Verification';
      default:
        return type;
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Verification Review
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review and approve user verification requests
            </p>
          </div>
          <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-4 py-2 rounded-lg">
            <Clock className="w-5 h-5" />
            <span className="font-medium">{verifications.length} pending</span>
          </div>
        </div>

        {verifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 dark:text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              All caught up!
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              No pending verifications to review
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {verifications.map((verification) => (
              <div
                key={verification.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {getTypeLabel(verification.type)}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          User ID: {verification.userId.slice(0, 8)}...
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Submitted:{' '}
                          {new Date(
                            verification.submittedAt as unknown as string
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedVerification(verification)}
                        className="btn-secondary text-sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </button>
                      <button
                        onClick={() => handleApprove(verification.id)}
                        disabled={processing === verification.id}
                        className="btn-primary text-sm"
                      >
                        {processing === verification.id ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVerification(verification);
                          setShowRejectModal(true);
                        }}
                        disabled={processing === verification.id}
                        className="btn-danger text-sm"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {selectedVerification && !showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Verification Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                    <p className="font-medium">
                      {getTypeLabel(selectedVerification.type)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                    <p className="font-medium font-mono text-sm">
                      {selectedVerification.userId}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Documents</p>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedVerification.documentUrls.map(
                        (url, index) => (
                          <div
                            key={index}
                            className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
                          >
                            {url.includes('.pdf') ? (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                              </div>
                            ) : (
                              <img
                                src={url}
                                alt={`Document ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setSelectedVerification(null)}
                    className="flex-1 btn-secondary"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(selectedVerification.id);
                      setSelectedVerification(null);
                    }}
                    disabled={processing === selectedVerification.id}
                    className="flex-1 btn-primary"
                  >
                    {processing === selectedVerification.id ? (
                      <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                    ) : (
                      'Approve'
                    )}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 btn-danger"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedVerification && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Reject Verification
                </h2>

                <div className="mb-4">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 p-3 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">
                      Please provide a reason for rejection
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="label">Reason for rejection</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    className="input-field"
                    placeholder="e.g., Document is blurry, name doesn't match..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason('');
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!rejectReason.trim() || processing !== null}
                    className="flex-1 btn-danger"
                  >
                    {processing === selectedVerification.id ? (
                      <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                    ) : (
                      'Confirm Rejection'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
