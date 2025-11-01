# 勤務管理システム

Next.js + Prisma + PostgreSQLで構築されたシンプルな勤怠管理アプリケーションです。

## 特徴

- 🌟 シンプルで使いやすいUI（イエローベース）
- 🔐 シンプルな認証システム（名前とパスワードのみ）
- ⏰ 出勤・退勤の打刻機能
- 📊 勤怠履歴の閲覧
- 🎨 レスポンシブデザイン

## 技術スタック

- **フロントエンド**: Next.js 15, React 18, TypeScript
- **スタイリング**: Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: PostgreSQL
- **ORM**: Prisma
- **認証**: JWT (jose)
- **パスワードハッシュ化**: bcryptjs

## 環境構築

### 必要な環境

- Node.js 18以上
- PostgreSQL 14以上

### 1. リポジトリのクローン

```bash
cd attendance-system
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成します：

```bash
cp .env.example .env
```

`.env`ファイルを編集して、データベース接続情報を設定：

```env
DATABASE_URL="postgresql://username:password@localhost:5432/attendance_db"
JWT_SECRET="your-very-long-random-secret-key-here"
NODE_ENV="development"
```

### 4. データベースのセットアップ

PostgreSQLデータベースを作成：

```bash
# PostgreSQLにログイン
psql -U postgres

# データベースを作成
CREATE DATABASE attendance_db;

# 終了
\q
```

Prismaマイグレーションを実行：

```bash
npx prisma migrate dev --name init
```

Prisma Clientを生成：

```bash
npx prisma generate
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 使い方

### 1. 新規登録

1. 新規登録ページで名前とパスワードを入力
2. パスワードは英数字で自由に設定可能（制約なし）
3. 登録完了後、自動的にログインされダッシュボードへ

### 2. ログイン

1. ログインページで登録した名前とパスワードを入力
2. ログイン成功後、ダッシュボードへ

### 3. 出勤・退勤

1. ダッシュボードの「出勤」ボタンをクリックして出勤打刻
2. 「退勤」ボタンをクリックして退勤打刻
3. 出勤中は現在の出勤時刻が表示されます

### 4. 勤怠履歴の確認

1. ダッシュボードの「勤怠履歴を見る」をクリック
2. 過去の勤務記録と統計情報を確認

## データベース構造

### User（ユーザー）

| カラム    | 型       | 説明                   |
| --------- | -------- | ---------------------- |
| id        | String   | ユーザーID（CUID）     |
| name      | String   | 名前（ユニーク）       |
| password  | String   | ハッシュ化パスワード   |
| createdAt | DateTime | 作成日時               |
| updatedAt | DateTime | 更新日時               |

### Attendance（勤怠）

| カラム    | 型       | 説明               |
| --------- | -------- | ------------------ |
| id        | String   | 勤怠ID（CUID）     |
| userId    | String   | ユーザーID         |
| clockIn   | DateTime | 出勤時刻           |
| clockOut  | DateTime | 退勤時刻（null可） |
| createdAt | DateTime | 作成日時           |
| updatedAt | DateTime | 更新日時           |

## 開発用コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# Prisma Studio（DB GUI）起動
npx prisma studio

# マイグレーション作成
npx prisma migrate dev --name migration_name

# データベースリセット
npx prisma migrate reset
```

## デプロイ

### Vercel + Neon（推奨）

1. **Neonでデータベース作成**
   - [Neon](https://neon.tech)でアカウント作成
   - 新規PostgreSQLデータベース作成
   - 接続文字列をコピー

2. **Vercelにデプロイ**
   - [Vercel](https://vercel.com)でプロジェクトをインポート
   - 環境変数を設定：
     - `DATABASE_URL`: Neonの接続文字列
     - `JWT_SECRET`: ランダムな長い文字列

3. **マイグレーション実行**
   ```bash
   # ローカルから本番DBに対してマイグレーション
   DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy
   ```

### Railway（フルスタック）

1. Railwayでプロジェクト作成
2. PostgreSQLサービス追加
3. Next.jsアプリをデプロイ
4. 環境変数を自動設定

## トラブルシューティング

### データベース接続エラー

```bash
# PostgreSQLが起動しているか確認
# macOS
brew services list

# Linux
sudo systemctl status postgresql
```

### Prismaエラー

```bash
# Prisma Clientを再生成
npx prisma generate

# データベースをリセット
npx prisma migrate reset
```

## ライセンス

MIT

## 作成者

勤務管理システム開発チーム
