'use client';

/**
 * Dashboard Home Page
 * Welcome message and link to tasks
 * Requirements: 3.1, 3.2
 */

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome, {user?.name}!
        </h2>
        <p className="text-gray-600 mb-6">
          Manage your tasks and keep track of your work efficiently.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/tasks"
            className="block p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
          >
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              My Tasks
            </h3>
            <p className="text-blue-700 text-sm">
              View and manage all your tasks
            </p>
          </Link>

          <Link
            href="/dashboard/profile"
            className="block p-6 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
          >
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Profile
            </h3>
            <p className="text-green-700 text-sm">
              Update your account information
            </p>
          </Link>

          <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Quick Stats
            </h3>
            <p className="text-gray-700 text-sm">
              Track your productivity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
