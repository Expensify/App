# New Expensify Cloudflare Worker

This package serves the New Expensify web build (`dist/`) from Cloudflare with [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/).

The build and the Worker are uploaded together as one Worker version. A deploy is therefore atomic, and a rollback restores both the code and the assets.

## What the Worker does

Every request runs the Worker first (`run_worker_first: true`), which reads the file from the `ASSETS` binding and then:

| Request | Response |
| --- | --- |
| Any path | Security headers: HSTS, CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Document-Policy` |
| HTML (`/`, `/index.html`, any SPA deep link) | Each `<script nonce="nonce-random-value">` gets a per-request nonce that matches the CSP. `Cache-Control: no-cache`, with no `ETag` or `Last-Modified`, since a 304 would pair a cached body with a new nonce |
| Content-hashed files (`main-<16 hex>.bundle.js`, `name.<10 hex>.css`) | `Cache-Control: public, max-age=31536000, immutable` |
| Files with fixed names (`version.json`, `service-worker.js`, `manifest.json`, ...) | Default `public, max-age=0, must-revalidate`, with an `ETag` |
| `js`, `css`, `svg`, `wasm` and `ttf` files | The build's Brotli 11 twin (`foo.js.br`) with `Content-Encoding: br`, about 20% smaller than Cloudflare's edge compression. See [Brotli twins](#brotli-twins) |
| A request with a matching `If-None-Match` | `304`, answered by the Worker for every non-HTML file |
| A file the current build doesn't have (`/main-<old hash>.bundle.js`) | The file from a previous build, if the environment has a `PREVIOUS_BUILDS` bucket that holds it (see [Files from previous builds](#files-from-previous-builds)). Otherwise `404`, also when the bucket can't be read, so a stale tab gets a `ChunkLoadError` and recovers instead of parsing HTML as JavaScript |
| Any other path that does not exist (`/r/123`) | The app shell (`index.html`) with `200` |
| A `POST`, such as a form submit the app didn't cancel | `303` to the same URL, so the browser loads that page with a `GET` |
| `/.well-known/apple-app-site-association` and `/apple-app-site-association` | The same file with `Content-Type: application/json` |

[`.assetsignore`](.assetsignore) keeps source maps (`*.map`) out of the upload. Wrangler's `build` command (`scripts/prepareDist.sh`) copies it into `dist/` before every `wrangler dev` and `wrangler deploy`, so always run wrangler from this directory.

The CSP lives in [`src/csp.ts`](src/csp.ts). The `ENVIRONMENT` variable in [`wrangler.jsonc`](wrangler.jsonc) selects the staging or production policy.

## Live development

From the App root, run `npm install`, complete the [web HTTPS/hosts setup](../../contributingGuides/SETUP_WEB.md), then run `npm run web`. The root install includes this package's independently locked dependencies.

The browser opens the Worker at `https://dev.new.expensify.com:8082/`. `wrangler.dev.jsonc` runs the same entry point against live Rsbuild output over loopback HTTP, with no `dist/`, R2, Cloudflare credentials, or ngrok dependency. React Fast Refresh uses WSS through the Worker; Wrangler automatically reloads Worker code and imported modules on edits. Reload the document to test changed CSP headers.

Only the explicit `development` environment can forward to `DEV_UPSTREAM`, which must be an HTTP `127.0.0.1` origin with a port. The launcher supplies that port, and development CSP adds the public HMR origin, existing local backend endpoints, and explicit configured API origins. Live assets are not cached immutably. Staging/production still use static assets, their original CSP, and normal caching/R2 behavior.

`USE_CLOUDFLARE_WORKER=false npm run web` bypasses the Worker but leaves the API proxy enabled. `USE_WEB_PROXY=false` disables only the API proxy. `WEB_PORT`, `WEB_INTERNAL_PORT`, and `WEB_OPEN=false` control isolated sessions and browser automation. Shell values take precedence over `.env`; occupied ports fail clearly. See the web setup guide for local backend settings and troubleshooting.

### Startup and logs

Wrangler starts only after Rsbuild returns its first successful HTTP response, so normal compilation does not produce Worker `503` request logs. The browser opens after the public HTTPS Worker is ready.

Worker `console.log`, `console.warn`, and `console.error` output appears in the terminal running `npm run web`, prefixed with `[worker]`. This is separate from the application's browser console.

Wrangler also exposes a local observability API on the same listener. For the default public port, query recent captured request and console logs with:

```bash
curl https://127.0.0.1:8082/cdn-cgi/local/explorer/api/local/observability/query \
  -H 'Content-Type: application/json' \
  --data '{"sql":"SELECT ts_ms, level, message FROM logs ORDER BY ts_ms DESC LIMIT 20"}'
```

Use your chosen `WEB_PORT` if different. This is a local API, not a separate hosted Miniflare service; no Cloudflare credentials are required.

## Running a web build locally

`wrangler dev` runs the Worker in workerd, the same runtime Cloudflare uses, and serves `dist/` exactly as a deploy would. No Cloudflare account or credentials are needed.

### 1. Install

Root `npm install` installs these dependencies too. For an independent Worker checkout or CI job, install just this package:

```bash
cd web/cloudflare-worker
npm ci
```

### 2. Get a web build in `dist/`

Either build one from the App root:

```bash
npm run build-staging   # or `npm run build` for production
```

Or, to skip the build, download a released one and extract it in the App root. The archive goes to `/tmp` so it can't be committed:

```bash
gh release download <version> --repo Expensify/App --pattern webBuild.tar.gz --dir /tmp --clobber
rm -rf dist && tar -xzf /tmp/webBuild.tar.gz   # creates dist/
```

### 3. Start the Worker

```bash
npm run dev               # http://localhost:8787 with the staging CSP
npm run dev:production    # the same, with the production CSP
```

`wrangler dev` reloads when `dist/` changes. After rebuilding or swapping `dist/`, run `npm run prepare-dist` to restore `.assetsignore`, which the web build deletes.

To check the CSP exactly as browsers enforce it in production, serve over HTTPS:

```bash
npm run dev -- --local-protocol https
```

Over plain HTTP, a few third-party scripts that load protocol-relative URLs (Convert, Group-IB) request `http://` resources that the HTTPS-only CSP blocks. Over HTTPS there should be no CSP violations in the console.

> [!WARNING]
> The Worker sends `Strict-Transport-Security`. Open the HTTPS session in a throwaway browser profile, so `localhost` is not pinned to HTTPS for your other local projects.

### What you can't test locally

This built-site preview has no API proxy and uses API endpoints and third-party OAuth providers that accept only known origins, so sign-in can fail with CORS errors. This restriction is distinct from live `npm run web`, which retains the existing API proxy or a configured local backend. Do not infer that a successful built-site startup validates authentication, or that an API proxy makes third-party OAuth work on arbitrary origins.

## Checking the behavior

### Automated tests

```bash
npm test          # integration tests: the real wrangler.jsonc in workerd, against a fake web build
npm run typecheck # regenerates worker-configuration.d.ts with `wrangler types`, then type-checks src/ and tests/
```

The live-mode tests also launch the real `wrangler dev` CLI against an ephemeral HTTP/WebSocket upstream, exercising the same transport used by `npm run web`. Worker source watching is verified separately with the real app and browser: edit the entry point and `src/csp.ts`, verify subsequent responses change without restarting the command, then verify React Fast Refresh still works.

### Comparing headers with a live host

```bash
npm run compare-headers -- https://staging.new.expensify.com http://localhost:8787
npm run compare-headers -- https://new.expensify.com http://localhost:8787   # run `npm run dev:production` first
```

The script diffs status, caching and security headers for a fixed set of paths. Nonces are masked, and CSP differences are reported per directive.

### Manual checks in a browser

1. **CSP:** Open the app and check the console for CSP violations (over HTTPS, see above).
2. **Deep links:** Open a deep link such as `/settings/profile` directly and reload it.
3. **Service worker:** Check that it registers. In DevTools > Application > Service workers, its source is `/service-worker.js`.
4. **A deploy with a tab left open:**
   1. Open the app on one build.
   2. Replace `dist/` with a newer build and run `npm run prepare-dist`.
   3. Navigate to a page that lazy-loads code.
   4. Verify that the old chunk request returns `404`, the app reloads onto the new build, and `/version.json` reports the new version.

## Deploying

| Environment | Worker | Route | CSP |
| --- | --- | --- | --- |
| `test-staging` | `test-staging-new-expensify-assets` | `test-staging.new.expensify.com/*` (managed in Cloudflare, not in `wrangler.jsonc`) | Staging |
| `staging` | `staging-new-expensify-assets` | `staging.new.expensify.com/*` (managed in Cloudflare, not in `wrangler.jsonc`) | Staging |
| `production` | `new-expensify-assets` | None until switchover, then `new.expensify.com/*` (managed in Cloudflare, not in `wrangler.jsonc`) | Production |

Every staging and production deploy also deploys the same build to that environment's Worker (the `webDeploy` job in `.github/workflows/deploy.yml`). Staging deploys also deploy it to the `test-staging` Worker (`webDeployTestStaging`). They use `CLOUDFLARE_WORKERS_DEPLOY_TOKEN`, which can only edit these three Workers. That token can't read zones, so routes aren't in `wrangler.jsonc`: wrangler would try to sync them and fail.

The Worker deploy is required: if it fails, or `WEB_STAGING_HOST` or `WEB_PRODUCTION_HOST` doesn't report the new version in `/version.json`, the deploy fails. A new Worker version takes effect immediately, so no cache needs purging. The `test-staging` deploy is a trial, so its failures don't affect the staging deploy.

`test-staging` serves a staging build on a hostname nobody else uses.

To deploy one by hand, put a staging build in `dist/` and run:

```bash
npx wrangler deploy --env test-staging
```

CI also adds Storybook to `dist/docs` before deploying, so it is served at `/docs/index.html`.

### Brotli twins

The web build writes a Brotli 11 twin next to every `js`, `css`, `svg`, `wasm` and `ttf` file. The Worker serves the twin with `Content-Encoding: br` and `encodeBody: "manual"`, so Cloudflare sends its bytes as they are to clients that accept Brotli, instead of compressing the original itself. Cloudflare presents every request to the Worker with `Accept-Encoding: br, gzip`, and decodes and re-encodes the twin for clients that don't accept Brotli. Twins are never served at their own URLs (`/foo.js.br` is a `404`), and responses for these files carry `Vary: Accept-Encoding`.

The asset store gives a twin the same ETag as its original, so the twin gets its own (`"<etag>-br"`), and the Worker answers `If-None-Match` itself, ignoring the `W/` prefix Cloudflare adds to ETags of responses it re-encodes. Static Assets doesn't support `Range` requests, so those get the whole file.

The test harness decodes responses before the tests read them, so the tests identify the twin by its ETag. Check what clients actually receive against a deployed Worker, for example with `curl -H 'Accept-Encoding: gzip'`.

### Files from previous builds

Each Worker version only contains the files uploaded with it, but a tab still running an older build keeps requesting that build's chunks after a deploy. So every staging and production deploy also uploads its build, including Brotli twins but without `*.map` and Storybook, to that environment's R2 bucket, `new-expensify-web-assets-staging` or `new-expensify-web-assets-production`. Every file is re-uploaded each time, so a file still used by recent builds never reaches the bucket's 60-day expiry. When the current build doesn't have a file that a script or image requests, the Worker looks it up, its twin first, in its environment's bucket (the `PREVIOUS_BUILDS` binding; `test-staging` uses the staging one) and returns `404` only if it isn't there either. The current build always takes priority, and navigations never read from the bucket.

The buckets and their 60-day lifecycle rule are managed in Terraform. The upload uses `CLOUDFLARE_R2_WEB_ASSETS_ACCESS_KEY_ID` and `CLOUDFLARE_R2_WEB_ASSETS_SECRET_ACCESS_KEY`, an R2 token that can only read and write those buckets. `wrangler dev` uses an empty local bucket.

Workers Logs and traces are sampled in `staging` and `production` (`head_sampling_rate`), because the Worker runs for every asset request. `test-staging` logs and traces every request.

To check the config without credentials or uploading anything:

```bash
npx wrangler deploy --dry-run --env test-staging
```

Never commit credentials, account IDs or `.dev.vars` files here. This is a public repository.
