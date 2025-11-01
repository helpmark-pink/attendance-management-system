"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import Button from "./ui/Button";
import { Card, CardContent } from "./ui/Card";
import { AttendanceRecord } from "@/types/database";
import { formatTime } from "@/lib/utils";

interface AttendanceButtonProps {
  todayRecord?: AttendanceRecord | null;
  employeeId?: string;
}

export default function AttendanceButton({
  todayRecord,
  employeeId,
}: AttendanceButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseClient();

  const handleClockIn = async () => {
    setLoading(true);
    try {
      if (!employeeId) {
        alert("従業員情報が見つかりません");
        return;
      }

      const { error } = await supabase.from("attendance_records").insert({
        employee_id: employeeId,
        clock_in: new Date().toISOString(),
      });

      if (error) throw error;

      router.refresh();
    } catch (err) {
      console.error("出勤記録エラー:", err);
      alert("出勤記録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!todayRecord) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("attendance_records")
        .update({
          clock_out: new Date().toISOString(),
        })
        .eq("id", todayRecord.id);

      if (error) throw error;

      router.refresh();
    } catch (err) {
      console.error("退勤記録エラー:", err);
      alert("退勤記録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const isClockedIn = todayRecord && !todayRecord.clock_out;

  return (
    <Card className="bg-gradient-to-br from-blue-500 to-purple-600 border-0">
      <CardContent className="py-8">
        <div className="text-center space-y-4">
          <div className="text-white">
            <p className="text-lg font-medium mb-2">
              {new Date().toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </p>
            <p className="text-4xl font-bold">
              {new Date().toLocaleTimeString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {todayRecord && todayRecord.clock_out ? (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-white">
              <p className="text-lg font-medium">本日の勤務は終了しました</p>
              <p className="text-sm mt-1">
                {formatTime(todayRecord.clock_in)} -{" "}
                {formatTime(todayRecord.clock_out)}
              </p>
            </div>
          ) : (
            <div className="flex gap-4 justify-center mt-6">
              {!isClockedIn ? (
                <Button
                  onClick={handleClockIn}
                  disabled={loading}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-semibold shadow-lg"
                >
                  {loading ? "処理中..." : "出勤"}
                </Button>
              ) : (
                <Button
                  onClick={handleClockOut}
                  disabled={loading}
                  variant="danger"
                  className="px-8 py-3 text-lg font-semibold shadow-lg"
                >
                  {loading ? "処理中..." : "退勤"}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
