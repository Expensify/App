# Tooling tests

Tests for the code that builds, deploys and lints this repo — `.github/actions/`, `.github/libs/`,
`.github/scripts/` and `scripts/` — as opposed to the app itself. They run under
[`bun:test`](https://bun.com/docs/cli/test), not Jest.

## Running them

These run as part of `test:bun`, alongside the `server/` suite — one Bun invocation covering both roots.

```sh
# Everything Bun runs (this is what CI runs)
npm run test:bun

# Just this directory
TZ=utc bun test --parallel --preload ./scripts/stubReactNative.js --preload ./tests/tooling/setup.ts ./tests/tooling

# One file
TZ=utc bun test --parallel --preload ./scripts/stubReactNative.js --preload ./tests/tooling/setup.ts ./tests/tooling/GithubUtils.test.ts

# One test, by name
npm run test:bun -- -t 'getPullRequestNumberFromURL'
```

The leading `./` on a file path is required: without it Bun treats the argument as a name filter and finds
nothing, because `bunfig.toml` points bare `bun test` at `server/`.

Neither flag is optional:

- `--parallel` — runs each file in a worker process, and implies `--isolate`. Isolation is the load-bearing part:
  several files replace `fs`, `child_process` or a shared lib with `mock.module()`, and Bun shares one module
  registry (and `process.env`) across files unless each gets its own. Separate processes additionally give
  `CIGitLogic` its own working directory, which it changes.
- `--preload ./scripts/stubReactNative.js` — `generateTranslations.test.ts` reaches `src/languages/en`, which pulls
  in `react-native`, whose Flow syntax Bun can't parse. `bunfig.toml`'s top-level `preload` does not apply to
  `bun test`, so it has to be passed here. It's the same stub `bun scripts/generateTranslations.ts` runs with.

`--concurrent` is deliberately not used. It makes the tests *within* each file run at once, which does not help:
under `--parallel` the wall clock is set by the single longest file (`CIGitLogic`, ~52s of the ~53s total), and
that file has to stay ordered. It also breaks tests — 16 of the files here reset module-level spies in
`beforeEach`, so a concurrent sibling clears the mocks a running test is about to assert on. Measured on the full
suite: `--parallel` 52.9s and passing, `--parallel --concurrent --max-concurrency 7` 57.2s with 9 failures.

## Why bun:test and not Jest

`@actions/core` and `@actions/github` are ESM-only from their next majors. Jest resolves them through Babel's
CommonJS interop, so keeping these tests on Jest would mean maintaining hand-built CJS shims for every
`@actions/*` and `@octokit/*` package. Bun imports them natively.

That is also the rule for where a new test belongs: **if its import graph reaches `@actions/*` or `@octokit/*`,
it goes here.** Everything else — including scripts that only use `scripts/utils/*` — can stay in `tests/unit/`
under Jest.

Prefer importing the narrowest module that has what you need — `@src/CONST/LOCALES` is self-contained, whereas
`@src/types/onyx/Locale` re-exports the whole `@src/CONST` barrel and drags a large part of the app in with it.

## Differences from the Jest tests

Bun's `jest` object is close to Jest's but not identical. The gaps that come up here:

| Jest | Bun equivalent |
| --- | --- |
| `jest.mock('foo')` (automock) | `mock.module('foo', factory)`, before the module under test is imported. There is no automock, so stub each export you need. |
| `jest.requireActual('foo')` | `await import('foo')` before the `mock.module()` call. |
| `jest.advanceTimersByTimeAsync(ms)` | No equivalent; alternate `await Promise.resolve()` with `jest.advanceTimersByTime(ms)`. |
| `jest.mocked(fn)` / `jest.SpiedFunction<T>` | `Mock<T>` from `bun:test`. |
| `asMutable(core).getInput = mock` | `jest.spyOn(core, 'getInput')` — real ESM namespace exports are read-only. |

Because `mock.module()` is hoisting-sensitive, files that use it import the module under test with a top-level
`await import(...)` placed after the mock.

## Type-checking

These files are type-checked by the directory-scoped Bun project, `tsconfig.bun.json`. They get Bun and Node types,
including `bun:test` and Bun runtime APIs such as `$`. Add a new tooling test directly under `tests/tooling/`; no
tsconfig update is needed.

The Bun project avoids general app imports because Bun's globals conflict with the React Native and Jest globals used
by the app. Translation tooling may import `src/languages/en.ts`: its CONST dependencies use Bun-safe defaults, while
web and native builds resolve platform-specific runtime values.
