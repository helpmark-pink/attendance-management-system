'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';

interface AttendanceStatus {
  isClockedIn: boolean;
  attendance: {
    id: string;
    clockIn: string;
  } | null;
}

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchStatus();
    }
  }, [authLoading, user]);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/attendance/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Status fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    setActionLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/attendance/clock-in', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('出勤しました！今日も頑張りましょう！');
        await fetchStatus();
      } else {
        setMessage(data.error || '出勤処理に失敗しました');
      }
    } catch (error) {
      setMessage('出勤処理中にエラーが発生しました');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/attendance/clock-out', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('お疲れ様でした！');
        await fetchStatus();
      } else {
        setMessage(data.error || '退勤処理に失敗しました');
      }
    } catch (error) {
      setMessage('退勤処理中にエラーが発生しました');
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-yellow-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-yellow-800">
                こんにちは、{user?.name}さん
              </h1>
              <p className="text-yellow-600">今日も素敵な一日を！</p>
            </div>
            <button
              onClick={logout}
              className="btn btn-secondary"
            >
              ログアウト
            </button>
          </div>
        </div>

        {/* Clock Display */}
        <div className="card mb-6 text-center">
          <div className="text-6xl mb-4 animate-float">🕐</div>
          <div className="text-5xl font-bold text-yellow-800 mb-2">
            {format(currentTime, 'HH:mm:ss', { locale: ja })}
          </div>
          <div className="text-xl text-yellow-600">
            {format(currentTime, 'yyyy年MM月dd日 (EEEE)', { locale: ja })}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`card mb-6 text-center ${
            message.includes('失敗') || message.includes('エラー')
              ? 'bg-red-50 border-2 border-red-200'
              : 'bg-green-50 border-2 border-green-200'
          }`}>
            <p className={`text-lg font-semibold ${
              message.includes('失敗') || message.includes('エラー')
                ? 'text-red-700'
                : 'text-green-700'
            }`}>
              {message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleClockIn}
              disabled={actionLoading || status?.isClockedIn}
              className="btn btn-primary py-8 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-2">🌅</div>
              出勤
            </button>
            <button
              onClick={handleClockOut}
              disabled={actionLoading || !status?.isClockedIn}
              className="btn btn-secondary py-8 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-2">🌙</div>
              退勤
            </button>
          </div>

          {status?.isClockedIn && status.attendance && (
            <div className="mt-6 text-center">
              <p className="text-yellow-700 font-semibold">
                出勤時刻: {format(new Date(status.attendance.clockIn), 'HH:mm', { locale: ja })}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="card">
          <Link
            href="/history"
            className="btn btn-secondary w-full flex items-center justify-center gap-2"
          >
            <span className="text-2xl">📋</span>
            勤怠履歴を見る
          </Link>
        </div>
      </div>
    </div>
  );
}
