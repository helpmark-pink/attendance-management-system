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

    // Get all attendance records for the user
    const attendances = await prisma.attendance.findMany({
      where: {
        userId: session.userId,
      },
      orderBy: {
        clockIn: 'desc',
      },
    });

    return NextResponse.json({
      attendances,
    });
  } catch (error) {
    console.error('Get history error:', error);
    return NextResponse.json(
      { error: '履歴の取得に失敗しました' },
      { status: 500 }
    );
  }
}
