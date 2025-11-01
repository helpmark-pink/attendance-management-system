import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type SignupPayload = {
  name?: string;
  employeeId?: string;
  department?: string;
  email?: string;
  password?: string;
};

function validatePayload(payload: SignupPayload) {
  const errors: string[] = [];

  if (!payload.name?.trim()) {
    errors.push("氏名を入力してください。");
  }

  if (!payload.employeeId?.trim()) {
    errors.push("社員IDを入力してください。");
  }

  if (!payload.department?.trim()) {
    errors.push("部署を入力してください。");
  }

  if (!payload.email?.trim()) {
    errors.push("メールアドレスを入力してください。");
  }

  if (!payload.password?.trim()) {
    errors.push("パスワードを入力してください。");
  } else if (payload.password.length < 6) {
    errors.push("パスワードは6文字以上で入力してください。");
  }

  return errors;
}

export async function POST(request: Request) {
  let payload: SignupPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエスト形式が正しくありません。" },
      { status: 400 }
    );
  }

  const validationErrors = validatePayload(payload);
  if (validationErrors.length > 0) {
    return NextResponse.json(
      { error: validationErrors.join(" ") },
      { status: 400 }
    );
  }

  const name = payload.name!.trim();
  const employeeId = payload.employeeId!.trim();
  const department = payload.department!.trim();
  const email = payload.email!.trim().toLowerCase();
  const password = payload.password!;

  try {
    const adminClient = createAdminClient();

    if (adminClient) {
      try {
        const [{ data: emailExisting, error: emailCheckError }, { data: employeeIdExisting, error: employeeIdCheckError }] =
          await Promise.all([
            adminClient.from("employees").select("id").eq("email", email).maybeSingle(),
            adminClient.from("employees").select("id").eq("employee_id", employeeId).maybeSingle(),
          ]);

        if (emailCheckError) {
          throw emailCheckError;
        }

        if (employeeIdCheckError) {
          throw employeeIdCheckError;
        }

        if (emailExisting) {
          return NextResponse.json(
            { error: "このメールアドレスは既に登録されています。" },
            { status: 409 }
          );
        }

        if (employeeIdExisting) {
          return NextResponse.json(
            { error: "この社員IDは既に登録されています。" },
            { status: 409 }
          );
        }

        const { data: userData, error: createUserError } =
          await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              name,
              employee_id: employeeId,
              department,
            },
          });

        if (createUserError) {
          const status =
            "User already registered" === createUserError.message ? 409 : 400;
          return NextResponse.json(
            {
              error:
                status === 409
                  ? "このメールアドレスは既に登録されています。"
                  : createUserError.message,
            },
            { status }
          );
        }

        const userId = userData.user?.id;

        if (!userId) {
          return NextResponse.json(
            { error: "ユーザー作成に失敗しました。" },
            { status: 500 }
          );
        }

        const { error: upsertError } = await adminClient
          .from("employees")
          .upsert(
            {
              id: userId,
              email,
              name,
              employee_id: employeeId,
              department,
              role: "employee",
            },
            { onConflict: "id" }
          );

        if (upsertError) {
          await adminClient.auth.admin.deleteUser(userId);
          return NextResponse.json(
            { error: "従業員情報の保存に失敗しました。再度お試しください。" },
            { status: 500 }
          );
        }

        return NextResponse.json({ success: true });
      } catch (adminError) {
        const message =
          adminError instanceof Error
            ? adminError.message
            : typeof adminError === "object" &&
                adminError !== null &&
                "message" in adminError
              ? String((adminError as { message?: string }).message)
              : "";

        if (message.includes("Invalid API key")) {
          console.warn(
            "SUPABASE_SERVICE_ROLE_KEY が無効またはSupabaseプロジェクトと一致しないため、anonキーによる処理にフォールバックします。"
          );
        } else {
          throw adminError instanceof Error
            ? adminError
            : new Error(message || "管理APIの呼び出しに失敗しました。");
        }
      }
    }

    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseAnonKey || !supabaseUrl) {
      return NextResponse.json(
        {
          error:
            "Supabaseの環境変数が不足しています。NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          employee_id: employeeId,
          department,
        },
        emailRedirectTo: undefined,
      },
    });

    if (signUpError) {
      const message = signUpError.message ?? "登録に失敗しました。";
      const normalized = message.includes("duplicate key value")
        ? "この社員IDは既に使用されています。別のIDを指定してください。"
        : message;

      return NextResponse.json(
        { error: normalized },
        { status: message.includes("duplicate") ? 409 : 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API /auth/signup failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "予期せぬエラーが発生しました。";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
