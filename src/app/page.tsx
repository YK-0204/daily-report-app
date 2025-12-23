'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, UserCircle, Loader } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { useAuth, useTheme } from '@/context';
import { DEMO_USERS } from '@/types';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.push(user.role === 'admin' ? '/admin' : '/user');
    }
  }, [user, isLoading, router]);

  const handleLogin = (userId: string) => {
    login(userId);
    const selectedUser = DEMO_USERS.find((u) => u.id === userId);
    if (selectedUser) {
      router.push(selectedUser.role === 'admin' ? '/admin' : '/user');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const users = DEMO_USERS.filter((u) => u.role === 'user');
  const admins = DEMO_USERS.filter((u) => u.role === 'admin');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                日報アプリ
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                ログインするユーザーを選択してください
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <UserCircle className="w-4 h-4" />
                  一般ユーザー
                </h2>
                <div className="space-y-2">
                  {users.map((u) => (
                    <Button
                      key={u.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleLogin(u.id)}
                    >
                      <UserCircle className="w-5 h-5 mr-3 text-blue-500" />
                      {u.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h2 className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Shield className="w-4 h-4" />
                  管理者
                </h2>
                <div className="space-y-2">
                  {admins.map((u) => (
                    <Button
                      key={u.id}
                      variant="secondary"
                      className="w-full justify-start"
                      onClick={() => handleLogin(u.id)}
                    >
                      <Shield className="w-5 h-5 mr-3 text-purple-500" />
                      {u.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
              これはデモ用のログイン画面です。
              <br />
              実際のアプリケーションでは認証システムを使用します。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
