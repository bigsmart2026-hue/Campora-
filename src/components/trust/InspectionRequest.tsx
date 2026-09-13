import { useState } from 'react';
import { Shield, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { requestInspection } from '@/services/inspectionService';
import toast from 'react-hot-toast';

interface InspectionRequestProps {
  productId: string;
  sellerId: string;
  hasInspection?: boolean;
  onRequestComplete?: () => void;
}

export default function InspectionRequest({
  productId,
  sellerId,
  hasInspection = false,
  onRequestComplete,
}: InspectionRequestProps) {
  const { user } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);
  const [requested, setRequested] = useState(hasInspection);

  const canRequest =
    user && (user.id === sellerId || user.role === 'admin');

  const handleRequest = async () => {
    if (!user) {
      toast.error('Please login to request inspection');
      return;
    }

    setIsRequesting(true);

    try {
      await requestInspection(productId, sellerId);
      setRequested(true);
      toast.success('Inspection requested! An inspector will review your product.');
      onRequestComplete?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to request inspection');
    } finally {
      setIsRequesting(false);
    }
  };

  if (!canRequest) return null;

  if (requested) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <div>
          <p className="font-medium text-green-800 dark:text-green-300">Inspection Available</p>
          <p className="text-sm text-green-600 dark:text-green-400">
            This product can be inspected for added trust
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white">Platform Inspection</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Get your product inspected by a verified inspector for higher trust
            and visibility
          </p>
          <ul className="mt-2 space-y-1">
            <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-3 h-3 text-green-500" />
              Builds buyer confidence
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-3 h-3 text-green-500" />
              Higher search ranking
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-3 h-3 text-green-500" />
              "Platform Inspected" badge
            </li>
          </ul>
          <button
            onClick={handleRequest}
            disabled={isRequesting}
            className="btn-primary mt-4 text-sm"
          >
            {isRequesting ? (
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <Shield className="w-4 h-4 mr-2" />
            )}
            Request Inspection
          </button>
        </div>
      </div>
    </div>
  );
}
