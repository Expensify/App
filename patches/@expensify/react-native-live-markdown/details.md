# `@expensify/react-native-live-markdown` patches

### [@expensify+react-native-live-markdown+0.1.333+001+checkpointed-parser.patch](@expensify+react-native-live-markdown+0.1.333+001+checkpointed-parser.patch)

- Reason: Test patch for Expensify/App issue #95210. The current live markdown parser returns no ranges after 4000 characters to avoid slow full-string ExpensiMark parsing, which removes composer styling for long drafts. This patch replaces the active parsing path with a checkpointed incremental range scanner so small edits only rescan a bounded dirty window, merge cached ranges, and keep markdown styling available above 4000 characters without reintroducing whole-input parsing on every keystroke.

- E/App issue: https://github.com/Expensify/App/issues/95210
