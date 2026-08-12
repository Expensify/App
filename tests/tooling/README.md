# Tooling tests

Tests for the code that builds, deploys and lints this repo — `.github/actions/`, `.github/libs/`,
`.github/scripts/` and `scripts/` — as opposed to the app itself. They run under
[`bun:test`](https://bun.com/docs/cli/test), not Jest.

## Running them

```sh
# The whole directory (this is what CI runs)
npm run test:tooling

# One file — pass the flags yourself, the npm script can't forward a path
TZ=utc bun test --isolate --preload ./scripts/stubReactNative.js --preload ./tests/tooling/setup.ts ./tests/tooling/GithubUtils.test.ts

# One test, by name
npm run test:tooling -- -t 'getPullRequestNumberFromURL'

# Show the output the code under test writes (silenced by default, see setup.ts)
TEST_VERBOSE=true npm run test:tooling
```

The leading `./` on a file path is required: without it Bun treats the argument as a name filter and finds
nothing, because `bunfig.toml` points bare `bun test` at `server/`.

Neither flag is optional:

- `--isolate` — several files replace `fs`, `child_process` or a shared lib with `mock.module()`, and Bun shares
  one module registry across files unless each gets its own.
- `--preload ./scripts/stubReactNative.js` — `generateTranslations.test.ts` reaches `src/languages/en`, which
  pulls in `react-native`, whose Flow syntax Bun can't parse. `bunfig.toml`'s top-level `preload` does not apply
  to `bun test`, so it has to be passed here. It's the same stub `bun scripts/generateTranslations.ts` itself runs
  with.

## Why bun:test and not Jest

`@actions/core` and `@actions/github` are ESM-only from their next majors. Jest resolves them through Babel's
CommonJS interop, so keeping these tests on Jest would mean maintaining hand-built CJS shims for every
`@actions/*` and `@octokit/*` package. Bun imports them natively.

That is also the rule for where a new test belongs: **if its import graph reaches `@actions/*` or `@octokit/*`,
it goes here.** Everything else — including scripts that only use `scripts/utils/*` — can stay in `tests/unit/`
under Jest.

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

## Shared helpers

Anything these files import from `tests/utils/` gets pulled into `tests/tooling/tsconfig.json` as well as the
root config, so it is type-checked once with `@types/jest` and once with `@types/bun`. Only import helpers from
there that use neither runner's globals — `createMock` is the one in use today.
