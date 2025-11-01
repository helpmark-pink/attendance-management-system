import { createServerSupabaseClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import AdminEmployeeList from "@/components/AdminEmployeeList";
import AdminAttendanceList from "@/components/AdminAttendanceList";
import { redirect } from "next/navigation";

export default async function AdminPage() {
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

  // 管理者権限チェック
  if (employee?.role !== "admin") {
    redirect("/dashboard");
  }

  // 全従業員を取得
  const { data: allEmployees } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: false });

  // 今日の全勤務記録を取得
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: todayAttendance } = await supabase
    .from("attendance_records")
    .select(
      `
      *,
      employee:employees(*)
    `
    )
    .gte("clock_in", today.toISOString())
    .lt("clock_in", tomorrow.toISOString())
    .order("clock_in", { ascending: false });

  // 統計
  const totalEmployees = allEmployees?.length || 0;
  const todayClockedIn =
    todayAttendance?.filter((r) => !r.clock_out).length || 0;
  const todayCompleted =
    todayAttendance?.filter((r) => r.clock_out).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-pink-950">
      <Header employee={employee} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* ヘッダー */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              管理画面
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <span className="font-medium">管理者権限</span>
            </div>
          </div>

          {/* 統計カード */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 shadow-xl hover:shadow-2xl transition-shadow">
              <CardContent className="py-6 sm:py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs sm:text-sm mb-2">
                      総従業員数
                    </p>
                    <p className="text-white text-3xl sm:text-4xl font-bold">
                      {totalEmployees}
                    </p>
                    <p className="text-purple-200 text-xs mt-1">人</p>
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 shadow-xl hover:shadow-2xl transition-shadow">
              <CardContent className="py-6 sm:py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs sm:text-sm mb-2">
                      本日の出勤中
                    </p>
                    <p className="text-white text-3xl sm:text-4xl font-bold">
                      {todayClockedIn}
                    </p>
                    <p className="text-green-200 text-xs mt-1">人</p>
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 border-0 shadow-xl hover:shadow-2xl transition-shadow sm:col-span-2 lg:col-span-1">
              <CardContent className="py-6 sm:py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs sm:text-sm mb-2">
                      本日の退勤済み
                    </p>
                    <p className="text-white text-3xl sm:text-4xl font-bold">
                      {todayCompleted}
                    </p>
                    <p className="text-blue-200 text-xs mt-1">人</p>
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
          </div>

          <Card>
            <CardHeader>
              <CardTitle>本日の出退勤状況</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminAttendanceList records={todayAttendance || []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>従業員一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminEmployeeList employees={allEmployees || []} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
