# Mentions highlighting in Composer input and chat messages

## Glossary
**Full mention** - called more simply `userMention` is the full email of a user. In Expensify app _every_ correct full email gets highlighted in text.
When parsed via ExpensiMark into html, this mention is described with tag `<mention-user>`.  
#### Examples of user mentions: `@john.doe@company.org`, `@vit@expensify.com`

**Short mention** - a special type of mention that contains only the login part of a user email **AND** the email domain has to be the same as our email domain. Any other `@mention` will not get highlighted if domains don't match
When parsed via ExpensiMark into html, it is described with tag `<mention-short>`.  

#### Examples of short mentions:
 - `@vit` - **IF** my domain is `expensify.com` **AND** there exists a user with email `vit@expensify.com` - it will get highlighted ✅
 - `@mateusz` - **IF** my domain is `expensify.com` **AND** there is **NO** user with email `mateusz@expensify.com`, but there is for example `mateusz@company.org` - it will NOT get highlighted ❌

**ExpensiMark** - parser that we are using, which allows for parsing between markdown <---> html formats. Imported from `expensify-common` package.

## tl;dr - the most important part
  - there are 2 slightly different flows of handling mentions - one is inside the Composer Input and the other outside of it
  - both are complex and need to support both userMentions and shortMentions - See **FAQ**

## Parsing mentions inside Composer/Input (LiveMarkdown)
Our `Composer` component uses `react-native-live-markdown` for writing and editing markdown and handling mentions. When discussing how mentions work **inside** the composer input always look for answers in this [library](https://github.com/Expensify/react-native-live-markdown).

### Mention parsing flow in live-markdown
1. User types in some text
2. `RNMarkdownTextInput` will handle the text by calling `parseExpensiMark`, which is an internal function of live-markdown: https://github.com/Expensify/react-native-live-markdown/blob/main/src/parseExpensiMark.ts
3. `parseExpensiMark` will use `ExpensiMark` for parsing, then do several extra operations so that the component can work correctly
4. When `ExpensiMark` parses the text, any full email will get parsed to `<mention-user>...</mention-user>` and any `@phrase` will get parsed to `<mention-short>...</mention-short>`
5. `userMentions` are ready to use as they are so they require no further modification, however for `shortMentions` we need to check if they actually should get the highlighting
5. We use the `parser` prop of `<MarkdownTextInput>` to pass custom parsing logic - this allows us to do some extra processing after `parseExpensiMark` runs.
6. Our custom logic will go over every `<mention-short>` entry and verify if this login is someone that exists in userDetails data, then transform this into a full mention which gets highlighting

**NOTE:** this entire process takes part only "inside" Composer input. This is what happens between user typing in some text and user seeing the markdown/highlights in real time.

## Parsing mentions outside of Composer/Input
When a user types in a message and wants to send it, we need to process the message text and then call the appropriate backend command.
However, backend only accepts text in html format. This means that text payload sent to backend has to be parsed via ExpensiMark. In addition, api **will not** accept `<mention-short>` tag - it only accepts full user mention with email. Frontend needs to process every `shortMention` into a `userMention` or stripping it completely from text.

### Mention processing flow when sending a message
1. After typing in some text user hits ENTER or presses the send button
2. Several functions are called but ultimately `addActions(...)` is the one that will prepare backend payload and make the Api call.
3. The function solely responsible for getting the correctly parsed text is `getParsedComment()` - it should return the string that is safe to send to backend.
4. We **do not** have access to `parseExpensiMark` or any functions that worked in worklets, as we are outside of `live-markdown` but we need to process `shortMentions` regardless.
5. The processing is done in `getParsedMessageWithShortMentions`: we parse via `ExpensiMark` with options very similar to what happens inside `parseExpensiMark` in `live-markdown`. (this is similar to Step 5. from previous flow).
6. We then find every `<mention-short>...</mention-short>` and try to see if the specific mention exists in userDetails data.

## FAQ
### Q: Why can't we simply use `parseExpensiMark` in both cases?!
We cannot call `parseExpensiMark` in both cases, because `parseExpensiMark` returns a special data structure, called `MarkdownRange` which is both created and consumed by `react-native-live-markdown`.

Expensify API only accepts HTML and not markdown range.

Useful graph:
```
ExpensiMark: (raw text with markdown markers) ----> (HTML)
parseExpensiMark: (raw text with markdown markers) ----> MarkdownRange[] structure
```
```
<MarkdownTextInput> accepts MarkdownRange[]
Expensify Api call accepts HTML
```
