import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
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

    return NextResponse.json({
      isClockedIn: !!activeAttendance,
      attendance: activeAttendance || null,
    });
  } catch (error) {
    console.error('Get status error:', error);
    return NextResponse.json(
      { error: 'ステータスの取得に失敗しました' },
      { status: 500 }
    );
  }
}
