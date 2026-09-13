import { Shield, CheckCircle, Star, Award } from 'lucide-react';
import { User } from '@/types';

interface TrustBadgeProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
}

export function VerificationBadge({
  isVerified,
  type,
  size = 'md',
}: {
  isVerified: boolean;
  type: 'campus' | 'id' | 'seller';
  size?: 'sm' | 'md' | 'lg';
}) {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-2.5 py-1',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const labels = {
    campus: 'Campus Verified',
    id: 'ID Verified',
    seller: 'Verified Seller',
  };

  const colors = {
    campus: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    id: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
    seller: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]} ${colors[type]}`}
    >
      <CheckCircle className={iconSizes[size]} />
      {labels[type]}
    </span>
  );
}

export function TrustScoreBadge({
  score,
  level,
  size = 'md',
}: {
  score: number;
  level: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-2.5 py-1',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const levelConfig = {
    bronze: { color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400', icon: Star },
    silver: { color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300', icon: Star },
    gold: { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: Award },
    platinum: { color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400', icon: Shield },
  };

  const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.bronze;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]} ${config.color}`}
    >
      <Icon className={iconSizes[size]} />
      {score}/100
    </span>
  );
}

export function ProductTrustBadge({
  isInspected,
  trustScore,
  size = 'md',
}: {
  isInspected: boolean;
  trustScore: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-2.5 py-1',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  if (isInspected) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ${sizeClasses[size]}`}
      >
        <Shield className={iconSizes[size]} />
        Platform Inspected
      </span>
    );
  }

  if (trustScore >= 70) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ${sizeClasses[size]}`}
      >
        <CheckCircle className={iconSizes[size]} />
        High Trust
      </span>
    );
  }

  return null;
}

export default function TrustBadges({ user, size = 'md' }: TrustBadgeProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {user.isCampusVerified && (
        <VerificationBadge isVerified type="campus" size={size} />
      )}
      {user.isIdVerified && (
        <VerificationBadge isVerified type="id" size={size} />
      )}
      {user.reputation.averageRating > 0 && (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 ${
            size === 'sm'
              ? 'text-xs px-1.5 py-0.5'
              : size === 'lg'
              ? 'text-sm px-2.5 py-1'
              : 'text-xs px-2 py-1'
          }`}
        >
          <Star
            className={
              size === 'sm'
                ? 'w-3 h-3'
                : size === 'lg'
                ? 'w-4 h-4'
                : 'w-3.5 h-3.5'
            }
          />
          {user.reputation.averageRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
