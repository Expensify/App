# Run the Cloudflare Worker during local web development

<!-- cspell:ignore securitypolicyviolation -->

## Goal and scope

Implement [Expensify/App#104387](https://github.com/Expensify/App/issues/104387): `npm run web` should run the actual NewDot Worker in local workerd through Wrangler/Miniflare, in front of the live Rsbuild server. Developers should encounter CSP, nonce, header, and routing problems locally, without sacrificing hot reload or requiring a Cloudflare account, a built `dist/`, or ngrok.

This document is a plan, not an implementation or a claim that the proposed topology has already passed browser testing.

- Base: freshly fetched App `origin/main`, `bc54f602df745cd1104297e7e1e230f8f130f1e8`.
- Branch: `plan/104387-local-cloudflare-worker`.
- Worktree: `/Users/rory/Expensidev/App-Worktrees/104387-local-cloudflare-worker`.
- Keep all implementation in App. Do not change live Cloudflare routes, deploy anything, modify the legacy Worker repository, or alter unrelated worktrees.

## Findings that shape the solution

1. Root `package.json` currently starts `web/proxy.ts` and Rsbuild concurrently; Rsbuild opens its own HTTPS origin. The Worker is a separately locked npm package, not a root workspace.
2. `web/cloudflare-worker/src/index.ts` already owns security headers, CSP nonces, HTML cache invalidation, AASA handling, missing-asset handling, and immutable caching. Use that implementation, not a separate imitation of the Worker in Rsbuild middleware.
3. The current Worker config requires `../../dist` and defaults to the staging CSP. Its static-assets/R2 tests and built-site preview commands must continue to work unchanged in meaning.
4. Rsbuild currently selects an available port starting at 8082 and embeds it as `process.env.PORT`; `CONFIG.DEV_PORT` uses that value. Moving the browser-facing origin without updating this contract can break links even if the first page loads.
5. `USE_WEB_PROXY=false` already disables the API proxy. Preserve that meaning. Add a separate Worker opt-out rather than silently repurposing this flag.
6. The old [local-testing instructions](https://github.com/Expensify/Cloudflare-Workers/tree/main/new.expensify.com#testing-locally) use ngrok to reach Rsbuild. [Cloudflare-Workers#188](https://github.com/Expensify/Cloudflare-Workers/pull/188) explicitly describes a Wrangler/custom-HTTP-port problem, linking [workers-sdk#5774](https://github.com/cloudflare/workers-sdk/issues/5774#issuecomment-2779972187). Separately, [App#38072](https://github.com/Expensify/App/issues/38072#issuecomment-2113231238) records an older `NODE_EXTRA_CA_CERTS` workaround. These are historical clues, not proof that the same problems affect the currently pinned Wrangler 4.144.0.

Reference code at the base revision:

- [Web scripts and installation](https://github.com/Expensify/App/blob/bc54f602df745cd1104297e7e1e230f8f130f1e8/package.json#L12-L35)
- [Rsbuild development configuration](https://github.com/Expensify/App/blob/bc54f602df745cd1104297e7e1e230f8f130f1e8/config/rsbuild/rsbuild.config.ts#L51-L89)
- [Worker response pipeline](https://github.com/Expensify/App/blob/bc54f602df745cd1104297e7e1e230f8f130f1e8/web/cloudflare-worker/src/index.ts#L83-L130)

## Preferred architecture: HTTPS outside, loopback HTTP inside

```text
Browser: https://dev.new.expensify.com:8082
  -> Wrangler / local workerd (existing mkcert certificate)
     -> http://127.0.0.1:<internal-port> (Rsbuild, live in-memory output)
        -> existing API proxy on port 9000, when enabled
           -> configured backend

Browser HMR: wss://dev.new.expensify.com:8082/rsbuild-hmr
  -> Worker WebSocket pass-through -> Rsbuild
```

Use 8082 as the preferred public port, preserving the existing hostname, browser storage, secure-context behavior, and familiar setup instructions. Select a distinct internal Rsbuild port. Share the resolved public and internal ports with all children; never let Rsbuild independently increment away from the Worker's configured upstream. On conflicts, select a coordinated available pair or fail with an actionable error, never attach to another worktree's server. Embed the **public** port in `CONFIG.DEV_PORT`.

The Worker must construct an explicit upstream URL with scheme, loopback address, port, path, and query. Do not depend on the old `dev.host`/implicit-origin forwarding behavior. Loopback HTTP avoids Worker-to-Rsbuild certificate validation entirely; the browser still uses trusted HTTPS and WSS. It does not justify allowing HTTP assets or insecure WebSockets in the browser.

### First implementation gate: prove the transport before plumbing everything in

- With pinned Wrangler and a minimal loopback HTTP/WebSocket upstream, verify custom-port fetch, streaming, POST forwarding, and a 101 upgrade through local workerd.
- Start Wrangler HTTPS using `--local-protocol https`, `--https-key-path`, and `--https-cert-path` pointing to the existing `config/rsbuild` mkcert files. Verify certificate trust in the browser, not just `curl -k`.
- Then repeat against real Rsbuild, checking its Host/Origin validation, HMR token/query handling, and emitted asset URLs.
- If WebSocket pass-through is incompatible with the current runtime, evaluate a direct **WSS** HMR connection to an HTTPS Rsbuild listener as the narrow fallback; keep page/assets behind the Worker and document the exact development-only CSP addition. Do not use `ws:` from an HTTPS page.
- Only retain ngrok as an explicitly documented troubleshooting fallback if a reproducible pinned-version issue remains. Do not require a tunnel for the default workflow, globally disable TLS verification, or clear `NODE_EXTRA_CA_CERTS` as a blanket fix.

## Implementation sequence

### 1. Install Worker tooling during normal setup

Keep the Worker as an independently locked package for minimal CI/deploy risk. Add a deterministic `npm ci --prefix web/cloudflare-worker --include=dev` step to root `scripts/postInstall.sh`, with clear failure output. Regenerate the Worker lockfile only if dependencies actually change; no Wrangler upgrade is necessary just to implement this issue.

Verify root `npm install`, root `npm ci`, and standalone setup install the Worker without recursive root lifecycle execution. Inspect HybridApp/CI callers before finalizing the hook; account for environments that intentionally omit development dependencies. Avoid assuming an npm install should be network-free, but ensure launching an already-installed `npm run web` never installs packages or asks for Cloudflare login. If inspection shows the hook is unsuitable, choose workspace integration explicitly and update all standalone Worker CI/deploy installs and locks together, rather than leaving mixed ownership.

### 2. Add local-only live-upstream configuration

- Add a dedicated development Wrangler config for live Rsbuild mode, using the same `src/index.ts` entry point and compatibility settings, but **no static-assets directory, prepare-dist build, remote bindings, or R2 dependency**. Factor shared config only if needed to prevent drift; do not duplicate Worker application logic.
- Select `ENVIRONMENT=development` explicitly and pass a local upstream binding only in this mode. Do not change the existing default built-site staging preview into live development mode.
- Preserve Wrangler's native source watching and automatic Worker reload for both the entry point and imported modules (including `src/csp.ts`). Editing Worker code must take effect on subsequent requests without restarting `npm run web`, rebuilding the app, or restarting Rsbuild/the API proxy. This is a separate requirement from React Fast Refresh; it does not require automatically refreshing an already-loaded browser document to replace its CSP headers.
- Regenerate/check Worker types for both configurations. Model the development upstream and production `ASSETS` binding without weakening typing to `any` or accidentally making deployment bindings optional everywhere.
- Select live forwarding only when the explicit development environment and validated loopback upstream are both present. Staging/production must never proxy to an arbitrary configured origin, even if an upstream variable is accidentally supplied.

### 3. Reuse the Worker response pipeline

- Separate response acquisition (Rsbuild fetch versus `ASSETS.fetch`) from the shared security-header/nonce transformation.
- Preserve request method, body, query, relevant headers, status, and streaming. Avoid double body consumption. Handle redirects deliberately so internal loopback URLs are not exposed to the browser.
- Pass WebSocket upgrades through without reconstructing the 101 response as an ordinary `Response` or feeding it into `HTMLRewriter`.
- Route API/attachment requests through Rsbuild's existing proxy table before any SPA/missing-static-asset logic; JSON API errors, receipt downloads, and non-GET requests must never become the app shell. Preserve existing backend response and caching semantics for these routes.
- For application assets/HTML, keep shared security headers and per-response nonce replacement. In development, disable immutable caching for changing bundles/hot-update files; maintain the HTML no-validator rule. Handle conditional upstream responses so a 304 cannot pair old HTML with a new CSP nonce.
- Preserve SPA navigation versus missing-asset distinctions, reserved-character deep links, AASA aliases/content type, HEAD behavior, and normal upstream errors. Return a useful local error when Rsbuild is unavailable, not a stale `dist/` fallback.
- Keep static-assets and previous-build R2 behavior intact for built-site previews and deploy environments. Document that live mode tests the common Worker pipeline, not the deployed asset router/R2 itself; the built-output test pass covers those separately.

### 4. Add the smallest development-only CSP delta

- Extend the existing CSP builder rather than copying staging/production policies. Keep their serialized directives unchanged apart from the existing per-request nonce.
- Add only explicit local origins required by observed requests: the chosen HMR WSS origin and, where needed, local API/backend origins such as `http://localhost:9000`. Normally the browser should use same-origin API routes through the Worker, not connect directly to port 9000.
- Verify browser mixed-content rules separately: putting an origin in CSP does not make every insecure request legal.
- Inspect actual development HTML for Rsbuild-injected inline scripts/React Refresh bootstrap. Supply nonces or narrowly scoped hashes when required; do not solve startup failures by adding blanket `script-src 'unsafe-inline'`, `connect-src *`, or disabling enforcement. Preserve the production template's existing hashes/nonce contract.
- Exercise internal `.env` local-backend overrides as well as contributor defaults. If configurable origins are needed, validate them and scope them to development rather than hard-coding one engineer's hostname or permitting all domains.

### 5. Wire startup, browser opening, and opt-outs

- Add a small typed launcher/config helper, following existing scripts/tooling conventions, to resolve environment precedence, the coordinated ports, readiness, and the browser origin once.
- Have `npm run web` retain Pusher setup and run the API proxy, Rsbuild, and Worker under `concurrently`. Suppress Rsbuild's `--open` in Worker mode and open exactly one browser tab at the Worker's root after the app is ready. Provide a no-open path for automation.
- Add `USE_CLOUDFLARE_WORKER=false` as the independent escape hatch: run/open Rsbuild directly over its existing trusted HTTPS setup. Keep `USE_WEB_PROXY=false` solely for disabling the API proxy.
- Load `.env` consistently with shell overrides taking precedence. Confirm the launcher, Rsbuild, API proxy, and bundled `CONFIG.IS_USING_WEB_PROXY` agree. Do not assume shell variables automatically override the serialized `__REACT_WEB_CONFIG__` object.
- On Ctrl-C or failure of a required long-running child, stop siblings and release ports. An intentionally disabled API proxy must not be treated as a crash that kills the other services. Surface missing certificates and occupied API/inspector ports clearly.

### 6. Document the supported workflows

Update root `README.md`, `contributingGuides/SETUP_WEB.md`, and `web/cloudflare-worker/README.md` with:

- One normal install/start path, public versus internal origin, existing mkcert/hosts prerequisites, and no ngrok/Cloudflare credentials requirement.
- Independent Worker and API-proxy flags, shell/`.env` precedence, readiness/port-conflict behavior, and how to test with a local backend.
- The difference between live Worker development and the retained `dist/` staging/production CSP preview commands.
- HMR/nonce/cache exceptions confined to development; troubleshooting for certificate trust, stale service workers, upstream failure, and optional ngrok fallback only if needed.
- Replace the overly broad claim that local sign-in is impossible: it applies to a built-site preview without an API proxy, not necessarily live development with the existing API proxy. Do not promise third-party OAuth works on arbitrary local origins.

## Validation plan (required before calling implementation complete)

### Automated checks

Extend existing `node:test`/workerd integration tests with a real ephemeral loopback upstream fixture, rather than mocking only `fetch`. Retain all existing static-assets tests. Document new tests with Given/When/Then comments.

| Area | Required assertions |
| --- | --- |
| Live transport | Path/query/method/body preservation, streaming, redirects, HEAD, upstream failures, WebSocket round trip and query/token preservation |
| Headers/nonces | Header set present; nonce matches allowed script and differs between loads; no placeholder remains; HTML cannot return a mismatched 304 |
| Routing | Root/deep links/reserved characters work; missing JS is 404 rather than HTML; API errors/downloads bypass SPA fallback; AASA aliases remain correct |
| Development cache | Edited bundles/hot updates are not immutable or stale; HTML validators removed |
| Worker reload | Under the real launcher, entry-point and imported CSP-module edits trigger Wrangler reload; subsequent requests reflect changes without restarting the command or other services; React HMR still works afterward |
| Isolation | Local origins allowed only in development; staging/production unchanged and cannot activate upstream forwarding; existing R2/static-asset tests pass |
| Launcher | Default/opt-out combinations, `.env` versus shell precedence, public port injection, coordinated port conflict, readiness, child failure and teardown |
| Installation | Fresh root/standalone install brings in Wrangler; existing independent Worker install/CI remains valid |

Run the Worker package's `npm test` and `npm run typecheck`; run focused Bun tooling tests for launcher/config helpers, `npm run lint-changed`, `npm run spell-changed`, and root `npm run typecheck` for changed TypeScript configuration/scripts. Run shellcheck if installation shell scripts change. React Compiler checks are needed only if React components/hooks change, which is not expected.

Expand `.github/workflows/cloudflareWorkerTests.yml` path filters if shared launcher/config/CSP inputs outside the Worker package now affect the tests. Keep its standalone install working. Run `wrangler deploy --dry-run` for `test-staging`, `staging`, and `production` against a real/fixture build to verify deploy configurations exclude development upstream/CSP settings; do not deploy.

### Real local end-to-end pass, including Playwright MCP

1. **Prepare an isolated environment.** Use this dedicated worktree and repo-pinned Node/npm/Bun versions. Ensure mkcert files and the hosts entry are present without copying private configuration into Git. Use a disposable browser profile because the Worker sends HSTS. Record chosen ports and confirm existing servers/worktrees are not being reused. No `dist/`, Worker `.dev.vars`, Cloudflare credentials, or ngrok should be required for this pass.
2. **Start the real command.** Run `npm run web` in the worktree with automation browser-opening disabled. Capture startup logs; verify all expected services run and the frontend readiness check passes at the Worker origin. Check HTTPS with certificate verification enabled. Confirm an ordinary interactive launch opens only the Worker URL.
3. **Attach Playwright MCP to the Worker origin**, not the internal Rsbuild port. Capture console messages, page errors, failed requests, and `securitypolicyviolation` events from before navigation using the browser tooling. Use observable UI/network readiness, not arbitrary sleeps. MCP is a required test tool, not a replacement for automated regression tests.
4. **Prove App startup.** Navigate to `/`, wait for the splash to disappear and the usable sign-in form to appear, verify scripts/CSS/fonts/images load, and save a screenshot plus console/network evidence. A 200 response or a rendered splash alone is not a pass. Compare CSP headers with script `.nonce` properties and check fresh navigations use fresh nonces.
5. **Prove the app runs beyond startup.** Use an approved disposable account/backend. For a local development backend, follow its test-account/code rules; do not assume the local `000000` code works against production. Complete sign-in/onboarding, navigate to settings and a report, open an existing attachment if available, refresh a deep link, and verify authenticated API calls and realtime connectivity. Prefer a local backend fixture for mutations; never create test financial data on production. Record any unavailable backend/account prerequisites as blockers rather than claiming end-to-end success.
6. **Prove both independent reload loops work.** First observe the successful WSS connection, make a temporary reversible React UI edit in this worktree, and confirm Fast Refresh applies it without a full-page reload and without losing entered text or the session. Check hot-update JS/JSON responses and CSP events, then restore only this test edit. Next, with the same `npm run web` session still running, make a harmless temporary Worker entry-point edit (such as a diagnostic response header), observe Wrangler reload, and verify subsequent requests expose the change. Separately edit the imported `src/csp.ts` module with a harmless development-only policy change, and verify a fresh Playwright navigation receives the updated enforced CSP. Do not restart the command, rebuild the app, or restart Rsbuild/the API proxy. Verify the authenticated session remains usable and React HMR works again after the Worker reload (allowing automatic WebSocket reconnection). Restore only these test edits and verify Wrangler reloads the original behavior. Record reload logs and before/after headers; an already-loaded page need not automatically acquire new document headers.
7. **Prove enforcement, not just absence of complaints.** In the disposable browser, attempt a harmless inline script without a nonce with a unique marker and a connection to an unapproved test origin. Verify CSP blocks them and produces the expected violation events. Allowed legitimate code/HMR must still work; expected negative-test violations must be distinguished from unexpected app violations.
8. **Check routing/cache/failure behavior.** Use browser network inspection and HTTP assertions for `/index.html`, a real deep link, a missing JS asset, AASA, and conditional HTML requests. Restart Rsbuild to check useful failure/recovery, then test fresh load and warm reload. Check for stale service-worker interference; live dev need not acquire a production service worker, but built-output preview must retain its service-worker behavior.
9. **Run the opt-out matrix below**, restarting cleanly for each case. Verify the chosen origin and running processes, not merely command exit status. Exercise both shell flags and `.env` configuration. Include an internal-backend configuration with the API proxy disabled.
10. **Validate built output separately.** Build staging and production output and use the retained Worker preview commands over HTTPS. Repeat startup/header/nonce/deep-link/cache/service-worker checks and run existing header-comparison tooling where appropriate. This validates real static-assets behavior absent from live Rsbuild mode. Built-preview sign-in/OAuth CORS limitations are distinct from live-mode regressions.
11. **Teardown and evidence.** Stop only processes started for this test, verify ports are released, remove temporary UI edits, and retain reproducible commands, test results, screenshots, and sanitized console/network logs. Do not retain auth tokens, test-account credentials, or certificate keys in committed artifacts. Report any pre-existing third-party network errors separately, with no unexplained new app/CSP failures accepted.

| Worker | API proxy | Expected result |
| --- | --- | --- |
| Default on | Default on | Worker HTTPS origin, real app load/sign-in, API forwarding, React Fast Refresh, and automatic Worker source/module reload |
| Off | On | Existing direct HTTPS Rsbuild experience; no Worker process |
| On | Off | Worker remains active; configured local backend works; no port-9000 proxy |
| Off | Off | Direct Rsbuild plus configured backend; neither proxy process |

## Acceptance and residual risks

- A fresh normal setup plus `npm run web` loads and operates the app through the real local Worker, with functional HMR and no mandatory ngrok, `dist/`, extra install, or Cloudflare authentication.
- Both reload loops are required: React edits apply through Fast Refresh, and Worker entry-point/imported-module edits apply through Wrangler's native reload on subsequent requests without manually restarting the development stack. Worker reload must not leave React HMR disconnected or the app unusable.
- Local security enforcement is verified positively and negatively in Playwright MCP, including authenticated interaction; HTTP-only fixtures or sign-in-page screenshots are insufficient evidence.
- Static-assets/deploy behavior and staging/production CSP are unchanged; development allowances cannot leak into deploy configurations.
- Opt-outs are independent and documented; process lifecycle, ports, certificate trust, and environment precedence are covered by tests.
- The transport spike is an explicit prerequisite: custom-port loopback fetch and WebSocket behavior have not yet been demonstrated in this planning task. If the preferred path fails, document the precise pinned-version failure and narrow fallback before expanding scope.
- Potential gaps that local workerd cannot fully reproduce include Cloudflare edge routing/cache behavior and provider-controlled OAuth origin restrictions. Do not weaken CSP or claim production parity for those merely to obtain a green local smoke test.

Official implementation references: [Wrangler dev options](https://developers.cloudflare.com/workers/wrangler/commands/workers/#dev), [Rsbuild HMR client configuration](https://rsbuild.dev/config/dev/client), and [Workers local development](https://developers.cloudflare.com/workers/local-development/). Verify flags against the pinned CLI's `--help` during implementation.
