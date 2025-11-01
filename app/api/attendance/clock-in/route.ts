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

    // Check if there's already an active attendance (no clock-out)
    const activeAttendance = await prisma.attendance.findFirst({
      where: {
        userId: session.userId,
        clockOut: null,
      },
    });

    if (activeAttendance) {
      return NextResponse.json(
        { error: '既に出勤しています' },
        { status: 400 }
      );
    }

    // Create new attendance record
    const attendance = await prisma.attendance.create({
      data: {
        userId: session.userId,
      },
    });

    return NextResponse.json({
      message: '出勤しました',
      attendance: {
        id: attendance.id,
        clockIn: attendance.clockIn,
      },
    });
  } catch (error) {
    console.error('Clock-in error:', error);
    return NextResponse.json(
      { error: '出勤処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
