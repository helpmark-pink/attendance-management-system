import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

// 環境変数が設定されていない場合の警告
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  console.warn(
    "⚠️  Supabase環境変数が設定されていません。.env.localファイルを作成してNEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_ANON_KEYを設定してください。"
  );
}

// クライアントコンポーネント用
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// 後方互換性のため（既存コードで使用されている）
export function getSupabaseClient() {
  return createClient();
}
