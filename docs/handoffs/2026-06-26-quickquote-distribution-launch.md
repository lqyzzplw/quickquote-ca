# Handoff — 2026-06-26 — QuickQuote CA: distribution launch prep

**Repo:** quickquote-ca (`/Volumes/MacMiniEx/Dropbox/Dropbox/Test Project Uno/quickquote-ca`) · **Branch:** main (in sync with origin)
**Current state:** Product is live + technically launch-ready with **0 real users (1 = the founder's test acct)**. This session built the entire *distribution layer* (blog, animated landing hero, Reddit + 小红书 copy, 小红书 cover images). Nothing has been *posted* yet — execution (post/publish) is the next move.

> ## 🚫 明令禁止 / Forbidden rules (read first — verbatim)
> - **AI 永不执行 merge** — 只 `push` + 开 PR，用户手动合并。对话中口头同意 ≠ 授权。
> - **push / merge / 删除 / reset 各自单独确认**，绝不与"出报告 / 看 diff"捆在一条指令里。授权严格按字面。
> - **Supabase 项目隔离**：QuickQuote = `zncgpsrhocybilzsbmds`（ca-central-1）。**任何 apply_migration / execute_sql 写操作前必须核对 project_id**，绝不传别的。ReloScope = `vfessonkchoyqxzhpehs`（同 org `obhvvlzgyryocfqowmnr`，同一 token 可写两个库 → 2026-04 曾污染过本库）。
> - **迁移文件**：14 位时间戳前缀 `YYYYMMDDHHMMSS_name.sql`，DDL 必须 idempotent（`IF NOT EXISTS`）。
> - **没有 MRR / 首个付费用户前不为锦上添花花钱** — 只用免费 tier，合规/域名/monitoring 推迟。
> - **secret 明文绝不进聊天** — 用户本地 `printf > .env.local`，Claude 只验 length+prefix。
> - **不在 Dropbox 挂载路径用 Write 工具写代码**（FUSE 上 Write 会假成功）；git 操作走 Bash 没问题（本 session 全程验证可用）。

## 进展 Progress

- [verified: `git log`/`vercel ls`/curl 200] **Blog 上线**：`/blog` 索引 + 首篇 `/blog/hst-on-contractor-quotes-ontario`（~1900 字 HST 实操指南，Article+FAQPage JSON-LD）。Commit `e5bf60d`。三条 route 全 200，sitemap 含 2 条 blog 条目。
- [verified: `npm run build` 通过 + 部署 Ready] **落地页改造**：导航/footer 加 Blog 链接、"Why Canadian tradespeople trust QuickQuote" trust band（数据驻留/PIPEDA/不训练 AI）、"From the blog" 模块。Commit `e5bf60d`。
- [verified: build 通过 + 部署 Ready] **Hero 动画 demo**：`src/components/HeroDemo.tsx` — 10 秒 loop（打字 → AI 解析 → line items → HST 高亮 → PDF 滑入），纯 CSS+React state，无后端调用无图片。Commit `8fccae8`。
- [verified: `gh run list` 连续 5/5 success] **Supabase keepalive 双保险**：GitHub Actions（每日 00:00 UTC，`.github/workflows/supabase-keepalive.yml`，commit `f342a4a`）+ Vercel cron（每日 12:00 UTC，`vercel.json`）。`CRON_SECRET` 在 Vercel prod env + GitHub repo secret 均已设。
- [verified: `vercel env pull` + `od -c` 检查] **生产 env 清理**：10 个变量的 trailing-LF 全部去除（`vercel env rm` → `printf | add`）。Stripe checkout 缺 `NEXT_PUBLIC_APP_URL` 改为 throw 而非 fallback localhost（commit `62ee255`）。
- [verified: information_schema + list_migrations 当前为空] **跨项目 drift 已清理**：2026-04 误入本库的 6 个 ReloScope 列（preferred_currency 等）已 DROP，污染的 migration `20260416191944` 记录已删。Postmortem 已归档进 SecondMe wiki：`wiki/insights/2026-05-01-supabase-mcp-cross-project-drift.md`（SecondMe repo，分支 Device-A.S.H，PR #13 未合）。

## 背景 Why / context

- **战略判断（本 session 核心）**：用户问能否靠 SEO/AISEO 推流 → 结论是**现在做不到，但要现在打地基**。SEO/AISEO 是 demand-harvesting（捕获已在搜索的人）；0 用户 0 外链时 AI chatbot 没有 ground signal 可引用。冷启动必须先 demand-generation（论坛/社群直接外联）产生 mentions/外链，3-6 个月后 SEO/GEO 才生效。结论：**distribution 优先于继续加功能**。
- **为什么 blog 自己站 + Medium 同步**：自己站拿长期 SEO 权重，Medium 借短期 organic 流量。**关键**：Medium 必须用 "Import a story" 设 canonical 指回自己站，否则权重被 Medium（DA 95）吞掉。
- **为什么 GitHub Actions 兜底 keepalive**：Vercel Hobby cron 不可靠（`0 12 */5 * *` 七天没触发导致 Supabase 2026-05-08 被冻）。双触发 + GH Actions 是免费 tier 公认方案。
- **为什么 keepalive 用 Vercel/GH Actions 而非 Claude `/schedule`**：远程 agent 在 claude.ai 云端跑，用不了本地 Supabase MCP；Vercel cron 直接复用已有 service-role env，零额外信任面。

## 下一步 Next steps（distribution 执行，按优先级）

1. **发 Reddit**（文案已在本 session 对话里生成，未落盘）：
   - #1 r/CanadianContractors（痛点切入，先观察 sub 30 天 self-promo 容忍度，发后自己补一条 disclosure comment）
   - #2 r/SideProject 或 r/EntrepreneurRideAlong（build-in-public，低风险打头阵）
   - 注意：新 Reddit 账号会被 mod 自动过滤，建议先混 karma 再发。
2. **Medium 同步 HST 文**：`Import a story` → 粘 `https://quickquote-ca.vercel.app/blog/hst-on-contractor-quotes-ontario` → **务必验证 canonical link 指回原文** → tags: HST/Ontario/Small Business/Canada/Contractor/Taxes/Trades。
3. **发小红书**（2 篇文案 + 2 张封面已生成）：
   - 封面 PNG 在 `marketing/xiaohongshu/cover-1-indie.png` / `cover-2-hst.png`（**当前未提交 git**）。改 HTML 后 `./marketing/xiaohongshu/render.sh` 重渲染。
   - 帖 #1 独立开发复盘（链接放评论/简介防限流）；帖 #2 HST 干货（"防风控"不放链接）。
   - 可选：补 carousel slides（用户尚未要）。
4. **观察一周** 哪个渠道有 click-through，再针对性加投。

## 环境陷阱 Gotchas

- **repo 在 Dropbox 挂载路径** → 不用 Write 工具写代码文件；marketing cover 渲染用 `render.sh`（headless Chrome，`--force-device-scale-factor=1` 必须，否则 Retina 出 2x 尺寸图）。
- **Notion connector 写权限失效**：本 session 多次 `notion-update-page` 报 "requires additional permissions"，重连未解决。更新 Notion Product Hub（page_id `3427902a-bb40-8180-a466-e6fe35c00a4c`）目前只能给用户 paste 的 markdown。注意现在有新的 `plugin_Notion_notion__*` 工具集，可重试。
- **`schema_migrations` 现为空（0 行）** 但本地有 2 个合法迁移文件（`20260415034259_initial_schema.sql`、`20260415040310_quote_number_function.sql`）。当前不影响运行（schema 经 MCP/dashboard 应用，repo 内无 Supabase CI）。**潜在 drift**：若将来接 `supabase db push`，需先按 supabase-migrations 规则回填 schema_migrations 行。
- **Vercel Hobby cron 可能被降级到 daily** — 已接受（更安全）；以 GH Actions 为主信号。

## 指针 Pointers

- 落地页 `src/app/page.tsx` · hero demo `src/components/HeroDemo.tsx`
- blog 注册表 `src/app/blog/posts.ts`（单一真相源，sitemap/首页/索引都读它）· 首篇 `src/app/blog/hst-on-contractor-quotes-ontario/page.tsx`
- keepalive `src/app/api/cron/keepalive/route.ts` · `.github/workflows/supabase-keepalive.yml` · `vercel.json`
- 小红书资产 `marketing/xiaohongshu/`（`cover-*.html` + `render.sh` + 已渲染 `*.png`，**未提交**）
- 生产：https://quickquote-ca.vercel.app · GitHub repo `lqyzzplw/quickquote-ca` · Vercel `xf-studio/quickquote-ca`
- Notion Product Hub page_id `3427902a-bb40-8180-a466-e6fe35c00a4c`
- SecondMe drift postmortem：`wiki/insights/2026-05-01-supabase-mcp-cross-project-drift.md`（SecondMe repo，分支 Device-A.S.H）

## 未决问题 Open questions

- `marketing/` 文件夹未提交 git — 要不要连同 handoff 一起 commit+push？（需用户单独确认）
- Notion Hub 的 keepalive + blog 进度还没同步上去（connector 权限问题）。
- 小红书 carousel slides 要不要补做（用户尚未拍板）。
- 真实付费转化仍 = 0；distribution 跑完后需要回看 funnel（landing → signup → quote created → Pro）。
