import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }

    // Find active attendance
    const activeAttendance = await prisma.attendance.findFirst({
      where: {
        userId: session.userId,
        clockOut: null,
      },
    });

    if (!activeAttendance) {
      return NextResponse.json(
        { error: '出勤記録がありません' },
        { status: 400 }
      );
    }

    // Update attendance with clock-out time
    const attendance = await prisma.attendance.update({
      where: {
        id: activeAttendance.id,
      },
      data: {
        clockOut: new Date(),
      },
    });

    return NextResponse.json({
      message: '退勤しました',
      attendance: {
        id: attendance.id,
        clockIn: attendance.clockIn,
        clockOut: attendance.clockOut,
      },
    });
  } catch (error) {
    console.error('Clock-out error:', error);
    return NextResponse.json(
      { error: '退勤処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
