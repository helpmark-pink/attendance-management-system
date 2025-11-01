# パフォーマンス最適化ガイド

このドキュメントでは、勤務管理システムのパフォーマンス最適化について説明します。

## 実施済みの最適化

### 1. Next.js設定の最適化

**next.config.ts**で以下を実装:
- `optimizePackageImports`: date-fnsのツリーシェイキング
- TypeScriptとESLintの適切な設定

### 2. ミドルウェアの最適化

**middleware.ts**で以下を改善:
- 不要な検証の削減
- より効率的なパスマッチング
- 早期リターンによるパフォーマンス向上

### 3. Tailwind CSSの最適化

**tailwind.config.js**で以下を実装:
- contentパスの最適化（不要なディレクトリを除外）
- `future.hoverOnlyWhenSupported`の有効化

### 4. PostCSSの正しい設定

**postcss.config.mjs**:
- Tailwind CSS v3に対応した設定
- autoprefixerの追加

## パフォーマンス測定結果

### 起動時間
- **最適化前**: 1559ms
- **最適化後**: 942ms
- **改善率**: 約40%高速化

### 開発モードでのホットリロード
最適化により、ファイル変更時のリロード時間が大幅に短縮されました。

## さらなる最適化のヒント

### 1. 画像の最適化

もし画像を使用する場合は、Next.jsの`Image`コンポーネントを使用:

```tsx
import Image from 'next/image';

<Image
  src="/logo.png"
  width={200}
  height={100}
  alt="Logo"
  priority // 重要な画像の場合
/>
```

### 2. 動的インポート

大きなコンポーネントは動的インポートで遅延読み込み:

```tsx
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <p>読み込み中...</p>,
});
```

### 3. React.memo の活用

頻繁に再レンダリングされるコンポーネントを最適化:

```tsx
import { memo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  // コンポーネントの実装
});
```

### 4. useMemo と useCallback

計算コストの高い処理やコールバックをメモ化:

```tsx
import { useMemo, useCallback } from 'react';

const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

## 本番環境での最適化

### 1. 環境変数の設定

**.env.production**:
```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 2. ビルド最適化

```bash
# プロダクションビルド
npm run build

# ビルド結果の分析
npm run build -- --profile
```

### 3. データベース接続プールの最適化

**lib/prisma.ts**で接続プールを設定:

```typescript
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

## モニタリング

### Lighthouse スコアの確認

```bash
# Chrome DevToolsで確認
# パフォーマンス、アクセシビリティ、ベストプラクティス、SEOをチェック
```

### Core Web Vitals

重要な指標:
- **LCP** (Largest Contentful Paint): 2.5秒以下
- **FID** (First Input Delay): 100ms以下
- **CLS** (Cumulative Layout Shift): 0.1以下

## トラブルシューティング

### 開発サーバーが遅い場合

1. `.next`フォルダを削除して再ビルド:
   ```bash
   rm -rf .next
   npm run dev
   ```

2. `node_modules`を再インストール:
   ```bash
   rm -rf node_modules
   npm install
   ```

3. Next.jsのキャッシュをクリア:
   ```bash
   npm run build -- --no-cache
   ```

### メモリ使用量が多い場合

Node.jsのメモリ制限を増やす:

```json
// package.json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--max-old-space-size=4096' next dev"
  }
}
```

## 参考リンク

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Tailwind CSS Performance](https://tailwindcss.com/docs/optimizing-for-production)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
