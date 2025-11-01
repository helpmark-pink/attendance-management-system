'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { format, differenceInMinutes } from 'date-fns';
import { ja } from 'date-fns/locale';
import Link from 'next/link';

interface Attendance {
  id: string;
  clockIn: string;
  clockOut: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchHistory();
    }
  }, [authLoading, user]);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/attendance/history');
      if (response.ok) {
        const data = await response.json();
        setAttendances(data.attendances);
      }
    } catch (error) {
      console.error('History fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWorkTime = (clockIn: string, clockOut: string | null) => {
    if (!clockOut) return '勤務中';

    const minutes = differenceInMinutes(new Date(clockOut), new Date(clockIn));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours}時間${mins}分`;
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
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard" className="btn btn-secondary">
              ← 戻る
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-yellow-800">勤怠履歴</h1>
              <p className="text-yellow-600">{user?.name}さんの勤務記録</p>
            </div>
          </div>
        </div>

        {/* Attendance List */}
        {attendances.length === 0 ? (
          <div className="card text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl text-yellow-700">まだ勤怠記録がありません</p>
            <p className="text-yellow-600 mt-2">出勤打刻をして記録を始めましょう！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attendances.map((attendance) => (
              <div key={attendance.id} className="card">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-yellow-600 mb-1">日付</p>
                    <p className="font-semibold text-yellow-800">
                      {format(new Date(attendance.clockIn), 'yyyy/MM/dd (EEE)', { locale: ja })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-600 mb-1">出勤</p>
                    <p className="font-semibold text-yellow-800 flex items-center gap-2">
                      <span className="text-xl">🌅</span>
                      {format(new Date(attendance.clockIn), 'HH:mm', { locale: ja })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-600 mb-1">退勤</p>
                    <p className="font-semibold text-yellow-800 flex items-center gap-2">
                      <span className="text-xl">🌙</span>
                      {attendance.clockOut
                        ? format(new Date(attendance.clockOut), 'HH:mm', { locale: ja })
                        : '---'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-600 mb-1">勤務時間</p>
                    <p className={`font-semibold ${
                      attendance.clockOut ? 'text-yellow-800' : 'text-green-600'
                    }`}>
                      {calculateWorkTime(attendance.clockIn, attendance.clockOut)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {attendances.length > 0 && (
          <div className="card mt-6">
            <h2 className="text-xl font-bold text-yellow-800 mb-4">統計</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 rounded-2xl p-4">
                <p className="text-sm text-yellow-600 mb-1">総勤務日数</p>
                <p className="text-3xl font-bold text-yellow-800">
                  {attendances.filter(a => a.clockOut).length}日
                </p>
              </div>
              <div className="bg-yellow-50 rounded-2xl p-4">
                <p className="text-sm text-yellow-600 mb-1">今月の勤務</p>
                <p className="text-3xl font-bold text-yellow-800">
                  {attendances.filter(a => {
                    const date = new Date(a.clockIn);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() &&
                           date.getFullYear() === now.getFullYear();
                  }).length}日
                </p>
              </div>
              <div className="bg-yellow-50 rounded-2xl p-4">
                <p className="text-sm text-yellow-600 mb-1">総レコード数</p>
                <p className="text-3xl font-bold text-yellow-800">
                  {attendances.length}件
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
