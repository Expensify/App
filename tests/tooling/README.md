# Tooling tests

Tests for the code that builds, deploys and lints this repo — `.github/actions/`, `.github/libs/`,
`.github/scripts/` and `scripts/` — as opposed to the app itself. They run under
[`bun:test`](https://bun.com/docs/cli/test), not Jest.

## Running them

```sh
# The whole directory (this is what CI runs)
npm run test:tooling

# One file — pass the flags yourself, the npm script can't forward a path
TZ=utc bun test --isolate --preload ./tests/tooling/setup.ts ./tests/tooling/GithubUtils.test.ts

# One test, by name
npm run test:tooling -- -t 'getPullRequestNumberFromURL'

# Show the output the code under test writes (silenced by default, see setup.ts)
TEST_VERBOSE=true npm run test:tooling
```

The leading `./` on a file path is required: without it Bun treats the argument as a name filter and finds
nothing, because `bunfig.toml` points bare `bun test` at `server/`.

`--isolate` is not optional. Several files replace `fs`, `child_process` or a shared lib with `mock.module()`,
and Bun shares one module registry across files unless each gets its own.

## Why bun:test and not Jest

`@actions/core` and `@actions/github` are ESM-only from their next majors. Jest resolves them through Babel's
CommonJS interop, so keeping these tests on Jest would mean maintaining hand-built CJS shims for every
`@actions/*` and `@octokit/*` package. Bun imports them natively.

That is also the rule for where a new test belongs: **if its import graph reaches `@actions/*` or `@octokit/*`,
it goes here.** Everything else — including scripts that only use `scripts/utils/*` — can stay in `tests/unit/`
under Jest.

There is one hard constraint on top of that rule: **nothing here may pull `src/` into its type graph.** This
directory type-checks with `@types/bun`, whose ambient JSX declarations conflict with the app's React and
react-native types, so a file that reaches `src/CONST` or `src/types/onyx` drags ~3,000 app files into this
project and produces thousands of spurious errors. Import the narrowest module that has what you need —
`@src/CONST/LOCALES` is self-contained, `@src/types/onyx/Locale` re-exports the whole `@src/CONST` barrel.

That constraint is why `tests/unit/generateTranslationsTest.ts` is still on Jest even though the script it covers
reaches `@actions/*`: the script itself imports `src/languages/en`, so its type graph can't be narrowed from the
test side. It needs the pure logic extracted, or its own type-check strategy, before it can move — and it has to
move before `@actions/*` goes ESM-only.

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

These files are type-checked by the root `tsconfig.json` along with everything else, so they see the app's real
types. `bun:test` resolves because that config pulls in `node_modules/bun-types/test.d.ts` — the one file in
bun-types that declares the module — through `files` rather than `include`, since `exclude` covers node_modules.

The rest of bun-types is deliberately left out: its global JSX declarations are incompatible with the app's React
types, and `generateTranslations.test.ts` reaches `src/` through the script it covers. One consequence is that
`@types/jest`'s globals are visible here too, so a missing `bun:test` import can type-check but still fail at
runtime — import every helper you use.
