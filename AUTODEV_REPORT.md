# AUTODEV Report

## Issue
- #83092 - `[$250] mWeb/Safari - Public room-Onboarding flow not appear when sign in from reply thread of public room`
- URL: https://github.com/Expensify/App/issues/83092

## Changed Files
- `src/pages/signin/SignInModal.tsx`
- `tests/unit/SignInModalTest.tsx`

## What Changed
- Updated `SignInModal` anonymous-to-auth transition sequencing to:
  1. wait for sequential queue idle,
  2. run `openApp(true)`,
  3. then dismiss the sign-in modal.
- Added regression test to verify modal dismissal happens only after `openApp(true)` resolves.

## Validation Commands
1. `npm test -- tests/unit/SignInModalTest.tsx --runInBand`
2. `npx prettier --write src/pages/signin/SignInModal.tsx tests/unit/SignInModalTest.tsx`
3. `npx eslint src/pages/signin/SignInModal.tsx tests/unit/SignInModalTest.tsx --max-warnings=0`
4. `npm test -- tests/unit/SignInModalTest.tsx --runInBand`

## Validation Results
- Targeted unit test: **PASS**
- Prettier: **PASS**
- ESLint on changed files: **PASS**
- Note: Jest reports existing repository warnings about duplicate manual mock names (`index`) during test startup; tests still execute and pass.

## Risks
- `SignInModal` dismissal now waits for `openApp(true)` completion. If `openApp(true)` is delayed by network latency, modal close can be delayed accordingly.
- Dismiss still runs in `.finally()`, so failures in `openApp(true)` will still close the modal; this preserves prior failure behavior while fixing ordering.
