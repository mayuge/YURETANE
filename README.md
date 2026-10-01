# ゆれたね
地震情報をきっかけに、同じ揺れを経験した人が感想を共有する小さなサイトです。

## GitHub Pages と Cloudflare

GitHub Pagesは画面を配信し、Cloudflare Workerが投稿API、D1が投稿の保存を担当します。D1のIDはブラウザーへ送る必要がありません。

1. GitHubのリポジトリ設定で **Pages** を開き、公開するブランチとフォルダーを選びます。
2. Cloudflareの **Workers & Pages** からこのリポジトリをWorkerとして接続し、`wrangler.jsonc` を使ってデプロイします。D1 binding `DB` は名前だけ定義しており、IDは設定ファイルに含めていません。Cloudflare側でD1を自動作成・管理します。
3. 作成されたD1データベースのConsoleで `migrations/0001_create_posts.sql`、続いて `migrations/0002_add_post_location.sql` のSQLを実行します。
4. Workerの公開URL（`https://...workers.dev`）を、`index.html` の`<meta name="yuretane-api">`の`content`に設定します。このURLは公開情報で、秘密情報ではありません。Workerは`https://*.github.io`からのブラウザーアクセスを許可します。

ローカルではCloudflareの開発環境から `npx wrangler dev` を使います。投稿地点は地図をクリックして選び、緯度・経度を感想と一緒にD1へ保存します。投稿と位置は公開されるため、一般公開前にCloudflare側でレート制限を設定し、通報・削除の運用方法も決めてください。

