# `@expensify/react-native-live-markdown` patches

### [@expensify+react-native-live-markdown+0.1.336+001+keep-the-parser-registration-symmetric.patch](@expensify+react-native-live-markdown+0.1.336+001+keep-the-parser-registration-symmetric.patch)

- Reason:

    ```
    MarkdownTextInput registered its parser worklet from a useMemo and only unregistered it from an effect cleanup, so registration was asymmetric. Whenever the effects remounted without the component unmounting, the cleanup erased the entry from the C++ registry (cpp/MarkdownGlobal.cpp) while the decorator view kept rendering the same, now dangling, parserId, and the re-run of the effect re-armed the cleanup without registering anything. Every later parse looked the id up with std::unordered_map::at, which throws: apple/MarkdownParser.mm caught std::out_of_range and returned no ranges, android/src/main/cpp/MarkdownParser.cpp let the exception travel out of the JNI call (fbjni turns it into a Java exception that MarkdownParser.java swallows), so the input silently stopped formatting markdown for the rest of its life. Two things trigger this in the app: React StrictMode, which mounts, cleans up and mounts effects again right after mount, and a screen wrapped in React <Activity> (ScreenActivityWrapper), whose every hide runs the subtree's cleanups and whose every reveal runs the bodies again. The patch moves registration into the effect body, keeps the matching unregister in its cleanup, and pushes the new id to the decorator view through state, so the id the view renders is always one the registry can resolve. The effect is a layout effect: React flushes its state update before yielding, so the commit that revealed the screen and the commit that carries the new id reach the mounting layer in the same task and collapse into one native transaction, instead of leaving the decorator on the erased id for a frame. The first registration still happens during the first render, because even a layout effect runs after the first commit was handed to the mounting layer and the decorator must never render an unknown id.
    ```

- Upstream PR/issue: https://github.com/Expensify/react-native-live-markdown/pull/776
- E/App issue: not filed yet, drafted in `repo/activity-home-migration/live-markdown-issues.md`
- PR introducing patch: https://github.com/Expensify/App/pull/100318

### [@expensify+react-native-live-markdown+0.1.336+002+tolerate-an-unknown-parser-id.patch](@expensify+react-native-live-markdown+0.1.336+002+tolerate-an-unknown-parser-id.patch)

- Reason:

    ```
    Even with the symmetric registration from patch 001 there is a short window in which the decorator view still carries an id the registry no longer has: between the effect cleanup that unregistered it (a hide of the <Activity> around the screen, or a parser that changed identity, which is what RNMarkdownTextInput does whenever currentUserMentions changes) and the commit that hands the view its replacement. The registry resolved ids with std::unordered_map::at, so a parse in that window threw std::out_of_range: iOS caught it in MarkdownParser.mm and returned no ranges, Android let it cross the JNI boundary, where fbjni wraps it into a Java exception that MarkdownParser.java catches, both of them paying for exception unwinding on every keystroke that lands in the window. The patch makes getMarkdownWorklet look the id up with find and return nullptr for an unknown one, and both native parsers return no ranges for a nullptr worklet without throwing. Formatting is not lost: the ranges are cached per (text, parserId), so the replacement id re-parses the same text as soon as the view receives it (updateProps on iOS, setParserId on Android both call applyNewStyles).
    ```

- Upstream PR/issue: https://github.com/Expensify/react-native-live-markdown/pull/776
- E/App issue: not filed yet, drafted in `repo/activity-home-migration/live-markdown-issues.md`
- PR introducing patch: https://github.com/Expensify/App/pull/100318
