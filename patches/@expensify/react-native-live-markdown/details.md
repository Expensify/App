# `@expensify/react-native-live-markdown` patches

### [@expensify+react-native-live-markdown+0.1.371+001+register-parser-worklet-in-insertion-effect.patch](@expensify+react-native-live-markdown+0.1.371+001+register-parser-worklet-in-insertion-effect.patch)

- Reason: `MarkdownTextInput` registered its parser worklet during render (`useMemo`) and unregistered it in an effect cleanup. React runs that cleanup without unmounting the component under StrictMode and whenever a hidden `<Activity>` disconnects effects, so the native view kept a parser id that pointed at nothing and the input silently stopped formatting markdown. The patch moves the registration into `useInsertionEffect` in a new `useParserId` hook, chooses the id in JS (one per mounted input, a fresh one on every `parser` change) and turns the native registry into a plain map. A parse for an id with no registered worklet logs a warning and returns no ranges without caching them, so the next parse picks the parser up once it is registered. It carries the `src/`, `lib/` and native (`cpp/`, `apple/`, `android/`) parts of the upstream PR.
- Depends on: the renderer running the insertion-effect cleanup for a component removed inside a hidden `<Activity>`, which the React 19.3 renderer bundled with React Native 0.88 does unconditionally. On an older renderer the worklet would leak in the native registry; formatting stays correct either way because ids are never reused.
- Upstream PR/issue: https://github.com/Expensify/react-native-live-markdown/pull/776 (on hold until the library can rely on React Native 0.88; drop this patch once the app upgrades to a release that contains it)
- E/App issue: https://github.com/Expensify/App/issues/98254
- PR introducing patch: https://github.com/Expensify/App/pull/102415

### [@expensify+react-native-live-markdown+0.1.371+002+preserve-browser-text-replacements.patch](@expensify+react-native-live-markdown+0.1.371+002+preserve-browser-text-replacements.patch)

- Reason: Chrome and Safari can replace text before the cached selection changes. Reconstructing every `insertText` event from that selection restores the word the browser replaced. Limit reconstruction to Firefox, where it preserves a line break removed while typing after a code fence. Native markdown handling and Firefox behavior are unchanged.
- Upstream PR/issue: No upstream PR yet; this is a contained web mitigation for the deploy blocker. The original macOS keyboard event sequence still needs verification before an upstream change.
- E/App issue: https://github.com/Expensify/App/issues/106439
- PR introducing patch: https://github.com/Expensify/App/pull/106440
