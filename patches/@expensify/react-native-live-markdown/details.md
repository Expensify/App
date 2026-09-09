# `@expensify/react-native-live-markdown` patches

### [@expensify+react-native-live-markdown+0.1.336+001+web-markdown-style-export.patch](@expensify+react-native-live-markdown+0.1.336+001+web-markdown-style-export.patch)

- Reason:

    ```
    `MarkdownTextInput.web.d.ts` never re-exported `MarkdownStyle`, unlike the native
    `MarkdownTextInput.d.ts` (which exports it aliased from `PartialMarkdownStyle`). The
    package's barrel `index.d.ts` re-exports `MarkdownStyle` from `./MarkdownTextInput`, and
    with App's web TypeScript program using `moduleSuffixes: [".web", ""]`, that specifier now
    resolves to `MarkdownTextInput.web.d.ts` first. Since `skipLibCheck` hides the resulting
    "no exported member" error inside node_modules, `MarkdownStyle` silently degraded to an
    `any`/error type wherever it flowed through the barrel on web (e.g. `useMarkdownStyle`'s
    return type), which `@typescript-eslint/no-unsafe-assignment` then flagged at every
    consumer. This patch adds `MarkdownStyle` to the web file's exports, matching the
    native file.
    ```

- Upstream PR/issue: 🛑, there's no upstream PR/issue found.
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/99495
