# Fresh-context review prompt

Give this to a reviewer that has not seen the implementation conversation. Paste it with `<base>` (normally `main`) and `<triage-file>` (the full path to `references/review-triage.md` in the babysit skill, next to this skill's folder) filled in. The reviewer reads files itself: do not paste the diff or your own summary of it.

---

You are reviewing a change in Expensify/App (New Expensify: React Native and web, Onyx for state) before it becomes a PR. You did not write it. Assume it has bugs and find them.

1. Read `CLAUDE.md` at the repo root. Its rules are binding. When a hunk touches their area, also read `contributingGuides/STYLING.md`, `contributingGuides/philosophies/ONYX-DATA-MANAGEMENT.md`, `contributingGuides/REACT_COMPILER.md` and `tests/README.md`.
2. Get the change with `git fetch upstream && git diff $(git merge-base upstream/<base> HEAD)`, plus every untracked file `git status` lists. If there is no `upstream` remote, `origin` is Expensify/App: use it instead. Fetch first, because a local `main` is often hundreds of commits behind. For every hunk, open the surrounding file and its callers. A hunk read on its own hides how it gets used.
3. Check the diff against "Patterns reviewers keep catching here" in `<triage-file>`.
4. Check App's contracts:
    - API calls: `optimisticData`, `successData` and `failureData` are all there, and `failureData` undoes what `optimisticData` changed. Command params match what the backend expects.
    - Offline: the change still works with no network. Pending actions show the right state, and nothing assumes a request already succeeded.
    - Onyx reads: `useOnyx` with a selector when a heavy key is read. No new `Onyx.connect`. A new `Onyx.connectWithoutView` needs a comment saying why `useOnyx` can't work there.
    - Copy: user-facing strings go through `translate`, nothing hardcoded.
    - Navigation: new routes have their params typed in `src/libs/Navigation/types.ts`. A screen reachable by deep link works logged in and logged out.
    - Styling: font sizes come from `<Text variant>`, narrow/wide spacing from `useLayoutSpacing()`. No raw `fontSize`, no `shouldUseNarrowLayout ? styles.x : styles.y` for padding.
    - React Compiler: no new `useMemo`, `useCallback` or `React.memo` in a file the compiler handles.
5. Check what agents tend to leave behind: comments that narrate the code, guards or try/catch the call site doesn't need, `as` casts or `any` to quiet the type checker, dead code, a second way of doing something the codebase already does one way, a runtime platform check where a platform file (`index.native.tsx`) is the pattern.
6. Check the tests. Would they fail if the change were reverted? Does each one have `// Given`, `// When`, `// Then` comments that say why? A test that mocks out the thing it's testing proves nothing.

Report only findings you can back with a concrete scenario. For each one give `file:line`, the severity, what goes wrong, the input or state that triggers it, and the fix.

- `critical`: wrong behavior, data loss, a security problem, or a broken contract (API params, Onyx shape, offline behavior).
- `important`: a guardrail break or maintainability problem a reviewer would block the PR on.

Skip anything ESLint, TypeScript, oxfmt or cspell already catch. If you find nothing, say so and don't pad the list.
