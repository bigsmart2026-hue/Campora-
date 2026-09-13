import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, Upload, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { fileDispute } from '@/services/disputeService';
import { getOrder } from '@/services/orderService';
import { Order } from '@/types';
import toast from 'react-hot-toast';

const disputeSchema = z.object({
  reason: z.string().min(5, 'Please provide a reason'),
  description: z.string().min(20, 'Please provide more details'),
});

type DisputeFormData = z.infer<typeof disputeSchema>;

const DISPUTE_REASONS = [
  'Item not as described',
  'Item received damaged',
  'Item not received',
  'Wrong item received',
  'Seller unresponsive',
  'Payment issue',
  'Other',
];

export default function FileDispute() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evidence, setEvidence] = useState<File[]>([]);
  const [evidencePreviews, setEvidencePreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DisputeFormData>({
    resolver: zodResolver(disputeSchema),
  });

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;

      try {
        const orderData = await getOrder(orderId);
        setOrder(orderData);
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  const handleEvidenceSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (evidence.length + files.length > 5) {
      toast.error('Maximum 5 evidence files allowed');
      return;
    }

    setEvidence((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEvidencePreviews((prev) => [
          ...prev,
          (e.target?.result as string) || '',
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeEvidence = (index: number) => {
    setEvidence((prev) => prev.filter((_, i) => i !== index));
    setEvidencePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: DisputeFormData) => {
    if (!user || !orderId) return;

    setSubmitting(true);
    try {
      await fileDispute(user.id, {
        orderId,
        reason: data.reason,
        description: data.description,
        evidence: evidence.length > 0 ? evidence : undefined,
      });

      toast.success('Dispute filed successfully');
      navigate(`/orders/${orderId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to file dispute');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">File a Dispute</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Report an issue with order #{orderId?.slice(-8)}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Reason */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Reason for Dispute
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {DISPUTE_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input
                    type="radio"
                    {...register('reason')}
                    value={reason}
                    className="w-4 h-4 text-primary-600 dark:text-primary-400"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{reason}</span>
                </label>
              ))}
            </div>
            {errors.reason && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.reason.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Description
            </h2>
            <textarea
              {...register('description')}
              rows={4}
              className="input-field"
              placeholder="Please describe the issue in detail..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Evidence */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Evidence (Optional)
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Upload photos or screenshots to support your claim
            </p>

            <div className="grid grid-cols-3 gap-4">
              {evidencePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
                >
                  <img
                    src={preview}
                    alt={`Evidence ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeEvidence(index)}
                    className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              ))}

              {evidence.length < 5 && (
                <label className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500 mb-1" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">Add</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleEvidenceSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 btn-secondary py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 btn-primary py-3"
            >
              {submitting ? (
                <Loader2 className="animate-spin h-5 w-5 mx-auto" />
              ) : (
                'Submit Dispute'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
