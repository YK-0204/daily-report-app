'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Calendar,
  Users,
  BarChart3,
  Brain,
  Settings,
  LogOut,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useTheme } from '@/context';
import { ThemeToggle } from './ThemeToggle';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const userNavItems: NavItem[] = [
    { href: '/user', label: 'ホーム', icon: <Home className="w-5 h-5" /> },
    { href: '/user/calendar', label: 'カレンダー', icon: <Calendar className="w-5 h-5" /> },
    { href: '/user/history', label: '履歴', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const adminNavItems: NavItem[] = [
    { href: '/admin', label: 'ダッシュボード', icon: <Home className="w-5 h-5" /> },
    { href: '/admin/my-report', label: 'マイ日報', icon: <User className="w-5 h-5" /> },
    { href: '/admin/team', label: 'チーム', icon: <Users className="w-5 h-5" /> },
    { href: '/admin/analysis', label: 'AI分析', icon: <Brain className="w-5 h-5" /> },
    { href: '/admin/settings', label: '設定', icon: <Settings className="w-5 h-5" /> },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          日報アプリ
        </h1>
        {user && (
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <User className="w-4 h-4" />
            <span>{user.name}</span>
            <span className="px-1.5 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700">
              {isAdmin ? '管理者' : 'ユーザー'}
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <ThemeToggle />
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            ログアウト
          </button>
        </div>
      </div>
    </aside>
  );
}
