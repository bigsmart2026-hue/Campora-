import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Loader2,
  Clock,
  CheckCircle,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getPendingDisputes, assignDisputeToAdmin } from '@/services/disputeService';
import { Dispute } from '@/types';
import toast from 'react-hot-toast';

export default function AdminDisputes() {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    loadDisputes();
  }, []);

  async function loadDisputes() {
    try {
      const pendingDisputes = await getPendingDisputes();
      setDisputes(pendingDisputes);
    } catch (error) {
      console.error('Error loading disputes:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAssign = async (disputeId: string) => {
    if (!user) return;

    setAssigning(disputeId);
    try {
      await assignDisputeToAdmin(disputeId, user.id);
      toast.success('Dispute assigned to you');
      await loadDisputes();
    } catch (error) {
      toast.error('Failed to assign dispute');
    } finally {
      setAssigning(null);
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
              Dispute Resolution
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review and resolve customer disputes
            </p>
          </div>
          <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-4 py-2 rounded-lg">
            <Clock className="w-5 h-5" />
            <span className="font-medium">{disputes.length} pending</span>
          </div>
        </div>

        {disputes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 dark:text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              All caught up!
            </h2>
            <p className="text-gray-500 dark:text-gray-400">No pending disputes to review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <div
                key={dispute.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {dispute.reason}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Order: #{dispute.orderId.slice(-8)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Filed by: {dispute.filedBy.slice(0, 8)}...
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(
                            dispute.createdAt as unknown as string
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAssign(dispute.id)}
                        disabled={assigning === dispute.id}
                        className="btn-primary text-sm"
                      >
                        {assigning === dispute.id ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                          <>
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Assign to Me
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {dispute.description && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {dispute.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
