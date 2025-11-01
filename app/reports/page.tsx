import { createServerSupabaseClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import ReportTable from "@/components/ReportTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatMinutesToHours } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  const supabase = await createServerSupabaseClient();

  // 認証されたユーザーを取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // ユーザーIDから従業員情報を取得
  const { data: employee } = await supabase
    .from("employees")
    .select("*")
    .eq("id", user.id)
    .single();

  // 今月の勤務記録を取得
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const { data: monthRecords } = employee
    ? await supabase
        .from("attendance_records")
        .select("*")
        .eq("employee_id", employee.id)
        .gte("clock_in", firstDayOfMonth.toISOString())
        .lte("clock_in", lastDayOfMonth.toISOString())
        .order("clock_in", { ascending: false })
    : { data: null };

  // 統計を計算
  const totalWorkMinutes =
    monthRecords?.reduce((sum, record) => {
      return sum + (record.work_minutes || 0);
    }, 0) || 0;

  const totalDays = monthRecords?.filter((r) => r.clock_out).length || 0;
  const averageWorkMinutes =
    totalDays > 0 ? Math.round(totalWorkMinutes / totalDays) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <Header employee={employee} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          {/* ヘッダー */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              勤務レポート
            </h1>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              {now.getFullYear()}年{now.getMonth() + 1}月
            </div>
          </div>

          {/* 統計カード */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 shadow-xl hover:shadow-2xl transition-shadow">
              <CardContent className="py-6 sm:py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs sm:text-sm mb-2">
                      今月の総勤務時間
                    </p>
                    <p className="text-white text-2xl sm:text-3xl font-bold">
                      {formatMinutesToHours(totalWorkMinutes)}
                    </p>
                  </div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-xl hover:shadow-2xl transition-shadow">
              <CardContent className="py-6 sm:py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs sm:text-sm mb-2">
                      今月の出勤日数
                    </p>
                    <p className="text-white text-2xl sm:text-3xl font-bold">
                      {totalDays}
                    </p>
                    <p className="text-purple-200 text-xs mt-1">日</p>
                  </div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 shadow-xl hover:shadow-2xl transition-shadow sm:col-span-2 lg:col-span-1">
              <CardContent className="py-6 sm:py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs sm:text-sm mb-2">
                      平均勤務時間/日
                    </p>
                    <p className="text-white text-2xl sm:text-3xl font-bold">
                      {formatMinutesToHours(averageWorkMinutes)}
                    </p>
                  </div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>今月の勤務履歴</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportTable records={monthRecords || []} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
