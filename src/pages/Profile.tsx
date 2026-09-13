import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Shield,
  Star,
  Package,
  Settings,
  LogOut,
  Camera,
  Edit,
  CheckCircle,
  Clock,
  School,
  Mail,
  Save,
  Loader2,
  TrendingUp,
  ShoppingBag,
  MapPin,
  Calendar,
  ArrowRight,
  Award,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { updateUserProfile } from '@/services/authService';
import { uploadAvatarToFirestore } from '@/utils/imageStorage';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'settings'>('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-3xl flex items-center justify-center">
            <User className="w-10 h-10 text-gray-300 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">Please login to view your profile</p>
          <Link to="/login" className="btn-primary inline-flex items-center px-6 py-3">
            Sign In
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      toast.error('Image must be less than 500KB');
      return;
    }

    setIsUploading(true);
    try {
      await uploadAvatarToFirestore(file, user.id);
      toast.success('Avatar updated!');
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!fullName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile(user.id, { fullName, phone });
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const stats = [
    {
      label: 'Reputation',
      value: user.reputation?.averageRating || '0.0',
      icon: Star,
      bgColor: 'bg-amber-50',
      iconColor: '#f59e0b',
      detail: `${user.reputation?.totalReviews || 0} reviews`,
    },
    {
      label: 'Transactions',
      value: user.reputation?.successfulTransactions || 0,
      icon: TrendingUp,
      bgColor: 'bg-emerald-50',
      iconColor: '#059669',
      detail: 'Successful trades',
    },
    {
      label: 'Campus',
      value: user.campus || 'Not set',
      icon: School,
      bgColor: 'bg-primary-50',
      iconColor: '#10b981',
      detail: user.isCampusVerified ? 'Verified' : 'Not verified',
      isText: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Profile Header */}
        <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-soft overflow-hidden mb-8 animate-fade-in-up">
          {/* Banner */}
          <div className="relative h-48 sm:h-56">
            <div className="absolute inset-0 bg-primary-600" />
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }} />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            {/* Floating badges */}
            {user.isIdVerified && (
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl text-white text-xs font-semibold border border-white/10">
                <Shield className="w-3.5 h-3.5" />
                ID Verified
              </div>
            )}
            {user.isCampusVerified && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-xl text-white text-xs font-semibold border border-white/10">
                <CheckCircle className="w-3.5 h-3.5" />
                Campus Verified
              </div>
            )}
          </div>

          {/* Profile info */}
          <div className="relative px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-16">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white dark:bg-gray-700 rounded-3xl border-4 border-white dark:border-gray-700 shadow-lg flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:shadow-xl">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary-500 flex items-center justify-center text-white text-4xl font-bold">
                      {user.fullName.charAt(0)}
                    </div>
                  )}
                </div>
                <label className="absolute bottom-1 right-1 p-2 bg-primary-600 rounded-xl text-white hover:bg-primary-700 cursor-pointer shadow-lg transition-all duration-200 hover:scale-105">
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploading} />
                </label>
                <div className="absolute inset-0 rounded-3xl ring-2 ring-primary-500/20 ring-offset-4 ring-offset-white dark:ring-offset-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0 sm:mb-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white truncate">{user.fullName}</h1>
                  <div className="flex gap-2">
                    {user.isIdVerified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-700">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                  {user.campus && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {user.campus}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setActiveTab('settings')}
                className="btn-secondary flex-shrink-0 group"
              >
                <Edit className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-card group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                  <p className={`mt-2 ${stat.isText ? 'text-lg' : 'text-3xl'} font-bold text-gray-900 dark:text-white truncate`}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.detail}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6" style={{ color: stat.iconColor }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl mb-8">
          {([
            { id: 'overview' as const, label: 'Overview', icon: User },
            { id: 'verification' as const, label: 'Verification', icon: Shield },
            { id: 'settings' as const, label: 'Settings', icon: Settings },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-soft'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent-500" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { onClick: () => navigate('/orders'), icon: Package, label: 'My Orders', color: 'hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-200 dark:hover:border-primary-700' },
                  { onClick: () => setActiveTab('verification'), icon: Shield, label: 'Verify Account', color: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-700' },
                  { onClick: () => navigate('/wishlist'), icon: Star, label: 'Wishlist', color: 'hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-200 dark:hover:border-amber-700' },
                  { onClick: () => { logout(); navigate('/'); }, icon: LogOut, label: 'Logout', color: 'hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-700' },
                ].map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-soft group ${action.color}`}
                  >
                    <action.icon className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {[
                  { icon: ShoppingBag, text: 'Listed "MacBook Pro 14"', time: '2 days ago', color: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' },
                  { icon: Star, text: 'Received 5-star review', time: '3 days ago', color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
                  { icon: CheckCircle, text: 'Completed delivery #1234', time: '1 week ago', color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className={`w-10 h-10 ${activity.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <activity.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.text}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Verification Tab */}
        {activeTab === 'verification' && (
          <div className="space-y-4 animate-fade-in-up">
            {/* Campus Verification */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-gray-700 group hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <School className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Campus Verification</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Verify you're a student at your campus to unlock buying and selling.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                        user.isCampusVerified
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-700'
                          : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-700'
                      }`}>
                        {user.isCampusVerified ? (
                          <><CheckCircle className="w-3.5 h-3.5" /> Verified</>
                        ) : (
                          <><Clock className="w-3.5 h-3.5" /> Pending</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                {!user.isCampusVerified && (
                  <Link to="/verification" className="btn-primary flex-shrink-0 group/btn">
                    <Shield className="w-4 h-4 mr-2" />
                    Verify Now
                    <ArrowRight className="ml-1 w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>
            </div>

            {/* ID Verification */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-gray-700 group hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Award className="w-7 h-7 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">ID Verification</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Upload your student ID to become a verified seller and build trust.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                        user.isIdVerified
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-700'
                          : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-700'
                      }`}>
                        {user.isIdVerified ? (
                          <><CheckCircle className="w-3.5 h-3.5" /> Verified</>
                        ) : (
                          <><Clock className="w-3.5 h-3.5" /> Not Verified</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                {!user.isIdVerified && (
                  <Link to="/verification" className="btn-primary flex-shrink-0 group/btn">
                    <Shield className="w-4 h-4 mr-2" />
                    Upload ID
                    <ArrowRight className="ml-1 w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>
            </div>

            {/* Trust Score */}
            <div className="bg-gray-900 rounded-2xl p-8 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Your Trust Score</h3>
                  <p className="text-gray-400 text-sm">Based on verifications and reviews</p>
                </div>
              </div>
              <div className="flex items-end gap-3 mt-6">
                <span className="text-5xl font-bold">
                  {user.isIdVerified && user.isCampusVerified ? '95' : user.isCampusVerified ? '70' : '30'}
                </span>
                <span className="text-gray-400 mb-2">/100</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-4">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${user.isIdVerified && user.isCampusVerified ? 95 : user.isCampusVerified ? 70 : 30}%`
                  }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-3">
                {!user.isCampusVerified
                  ? 'Verify your campus email to boost your score to 70+'
                  : !user.isIdVerified
                  ? 'Verify your ID to reach 95+ trust score'
                  : 'Excellent! Your trust score is at the highest level.'}
              </p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-soft border border-gray-100 dark:border-gray-700 animate-fade-in-up">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              Account Settings
            </h3>
            <div className="space-y-5 max-w-lg">
              <div>
                <label htmlFor="settings-fullName" className="label">
                  Full Name
                </label>
                <input
                  id="settings-fullName"
                  name="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="settings-email" className="label">
                  Email
                </label>
                <input
                  id="settings-email"
                  name="email"
                  type="email"
                  value={user.email}
                  className="input-field bg-gray-50 dark:bg-gray-700"
                  disabled
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label htmlFor="settings-phone" className="label">
                  Phone
                </label>
                <input
                  id="settings-phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                  placeholder="08012345678"
                />
              </div>
              <div>
                <label htmlFor="settings-campus" className="label">
                  Campus
                </label>
                <input
                  id="settings-campus"
                  name="campus"
                  type="text"
                  value={user.campus || ''}
                  className="input-field bg-gray-50 dark:bg-gray-700"
                  disabled
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Campus cannot be changed after verification</p>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="btn-primary flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
