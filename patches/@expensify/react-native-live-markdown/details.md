# # `react-native-live-markdown` patches

### [@expensify+react-native-live-markdown+0.1.317.patch](@expensify+react-native-live-markdown+0.1.317.patch)

- Reason:
    ```
    Adds support for the `submitBehavior` prop in MarkdownTextInput component for web.
    React Native deprecated `blurOnSubmit` in favor of `submitBehavior` (React Native 0.73+),
    but @expensify/react-native-live-markdown's MarkdownTextInput on web doesn't natively 
    support this prop. This patch implements the web equivalent behavior, mapping 
    `submitBehavior` values ('submit', 'blurAndSubmit', 'newline') to the appropriate 
    keyboard handling logic in handleKeyPress while maintaining backwards compatibility with 
    the deprecated `blurOnSubmit` prop. This aligns MarkdownTextInput with React Native's 
    TextInput API and react-native-web's TextInput implementation.
    ```
- Upstream PR/issue: https://github.com/Expensify/react-native-live-markdown/issues/744
- E/App issue: https://github.com/Expensify/App/issues/73782
- PR introducing patch: https://github.com/Expensify/App/pull/76332