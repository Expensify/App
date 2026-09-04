# `@expensify/react-native-live-markdown` patches

### [@expensify+react-native-live-markdown+0.1.336+001+keep-the-parser-registration-symmetric.patch](@expensify+react-native-live-markdown+0.1.336+001+keep-the-parser-registration-symmetric.patch)

- Reason:

    ```
    MarkdownTextInput registered its parser worklet from a useMemo and only unregistered it from an effect cleanup, so registration was asymmetric. Whenever the effects remounted without the component unmounting, the cleanup erased the entry from the C++ registry (cpp/MarkdownGlobal.cpp) while the decorator view kept rendering the same, now dangling, parserId, and the re-run of the effect re-armed the cleanup without registering anything. Every later parse looks the id up with std::unordered_map::at, which throws: apple/MarkdownParser.mm catches std::out_of_range and returns no ranges, android/src/main/cpp/MarkdownParser.cpp lets the exception travel out of the JNI call, so the input silently stops formatting markdown for the rest of its life. Two things trigger this in the app: React StrictMode, which mounts, cleans up and mounts effects again right after mount, and a screen wrapped in React <Activity>, whose every hide runs the subtree's cleanups and whose every reveal runs the bodies again. The patch moves registration into the effect body, keeps the matching unregister in its cleanup, and pushes the new id to the decorator view through state, so the id the view renders is always one the registry can resolve. The first registration still happens during the first render, because the effect runs after the first paint and the decorator must never render an unknown id.
    ```

- Upstream PR/issue: not filed yet, the same fix is needed upstream in `src/MarkdownTextInput.tsx`
- E/App issue:
- PR introducing patch:
