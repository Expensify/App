## Proposal

### Please re-state the problem that we are trying to solve in this issue.

When a user types a markdown hyperlink with multiline text (e.g., `[line1\nline2\nline3](https://example.com)`), the text is not displayed as a hyperlink in the conversation. Instead, it appears as plain text.

### What is the root cause of that problem?

The root cause is in the `expensify-common` library's `ExpensiMark.js` file. The `MARKDOWN_LINK_REGEX` pattern at line 46 explicitly excludes newline characters (`\r` and `\n`) from the link text:

```javascript
const MARKDOWN_LINK_REGEX = new RegExp(`\\[((?:[^\\[\\]\\r\\n]*(?:\\[[^\\[\\]\\r\\n]*][^\\[\\]\\r\\n]*)*))]\\(${UrlPatterns.MARKDOWN_URL_REGEX}\\)(?![^<]*(<\\/pre>|<\\/code>))`, 'gi');
```

The character class `[^\\[\\]\\r\\n]*` matches any character **except** `[`, `]`, `\r`, and `\n`. This means when the link text contains a newline, the regex fails to match and the hyperlink is not parsed.

### What changes do you think we should make in order to solve the problem?

The fix needs to be made in the `expensify-common` repository. The `MARKDOWN_LINK_REGEX` should be updated to allow newline characters in the link text portion while still excluding brackets.

The character class should be changed from `[^\\[\\]\\r\\n]*` to `[^\\[\\]]*` (or use a more permissive pattern with `[\s\S]` for the link text that still respects bracket boundaries).

After the fix is deployed in `expensify-common`, the App's dependency should be updated to pull in the new version.

### What alternative solutions did you explore? (Optional)

N/A - The fix must be in the parsing regex itself since that's where the restriction is defined. There's no workaround at the App level without duplicating the markdown parsing logic.
