import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Shield,
  Loader2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { formatPrice } from '@/utils/format';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  pendingVerifications: number;
  activeDisputes: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingVerifications: 0,
    activeDisputes: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [
          usersCount,
          productsCount,
          ordersCount,
          verificationsCount,
          disputesCount,
        ] = await Promise.all([
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(collection(db, 'products')),
          getCountFromServer(collection(db, 'orders')),
          getCountFromServer(
            query(
              collection(db, 'verifications'),
              where('status', '==', 'pending')
            )
          ),
          getCountFromServer(
            query(
              collection(db, 'disputes'),
              where('status', 'in', ['open', 'under_review'])
            )
          ),
        ]);

        setStats({
          totalUsers: usersCount.data().count,
          totalProducts: productsCount.data().count,
          totalOrders: ordersCount.data().count,
          pendingVerifications: verificationsCount.data().count,
          activeDisputes: disputesCount.data().count,
          totalRevenue: 0,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary-600 dark:text-primary-400" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
      link: '/admin/users',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      link: '/admin/products',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      link: '/admin/orders',
    },
    {
      title: 'Platform Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400',
      link: '/admin/reports',
    },
  ];

  const quickActions = [
    {
      title: 'Pending Verifications',
      count: stats.pendingVerifications,
      icon: Shield,
      color: 'text-yellow-600 dark:text-yellow-400',
      link: '/admin/verifications',
    },
    {
      title: 'Active Disputes',
      count: stats.activeDisputes,
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      link: '/admin/disputes',
    },
    {
      title: 'Live Deliveries',
      count: null,
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      link: '/admin/deliveries',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Admin Dashboard
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <Link
              key={stat.title}
              to={stat.link}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <action.icon className={`w-8 h-8 ${action.color}`} />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {action.title}
                    </p>
                    {action.count !== null && (
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {action.count}
                      </p>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
            </Link>
          ))}
        </div>

        {/* Admin Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Administration
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {[
              { title: 'User Management', link: '/admin/users', icon: Users },
              {
                title: 'Product Management',
                link: '/admin/products',
                icon: Package,
              },
              { title: 'Order Management', link: '/admin/orders', icon: ShoppingCart },
              {
                title: 'Verification Review',
                link: '/admin/verifications',
                icon: Shield,
              },
              { title: 'Dispute Resolution', link: '/admin/disputes', icon: AlertTriangle },
              { title: 'Live Deliveries', link: '/admin/deliveries', icon: TrendingUp },
              { title: 'Reports & Analytics', link: '/admin/reports', icon: DollarSign },
              { title: 'Audit Logs', link: '/admin/audit', icon: Clock },
            ].map((item) => (
              <Link
                key={item.title}
                to={item.link}
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <item.icon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="font-medium text-gray-900 dark:text-white">{item.title}</span>
                <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-auto" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
