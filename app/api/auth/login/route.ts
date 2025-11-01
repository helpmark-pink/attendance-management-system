import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';

const loginSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, password } = loginSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { name },
    });

    if (!user) {
      return NextResponse.json(
        { error: '名前またはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: '名前またはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    // Create session
    await createSession(user.id, user.name);

    return NextResponse.json({
      message: 'ログインしました',
      user: { id: user.id, name: user.name }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'ログイン中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
