# `react-native-pdf` patches

### [react-native-pdf+7.0.2+001+fix-onPressLink-android.patch](react-native-pdf+7.0.2+001+fix-onPressLink-android.patch)

- Reason:

    ```
    This patch fixes the onPressLink callback not working on Android by upgrading the pdfiumandroid library from version 1.0.32 to 1.0.35.
    
    The onPressLink prop works correctly on iOS but was broken on Android due to a bug in the older pdfiumandroid library.
    Version 1.0.35 includes fixes for link handling that make the callback work properly.
    ```
  
- Upstream PR/issue: https://github.com/wonday/react-native-pdf/issues/464, https://github.com/wonday/react-native-pdf/issues/983, https://github.com/wonday/react-native-pdf/issues/533
- E/App issue: https://github.com/Expensify/App/issues/73253
- PR introducing patch: https://github.com/Expensify/App/pull/75333


### [react-native-pdf+7.0.2+002+fix-pdf-crash-already-closed-android.patch](react-native-pdf+7.0.2+002+fix-pdf-crash-already-closed-android.patch)

- Reason:

    ```
    This patch fixes a fatal Android crash (java.lang.IllegalStateException: Already closed) that occurs when users navigate away from a PDF while it's still rendering.

    The crash is caused by a race condition between the background rendering thread and the main thread during component unmount. The fix sets AlreadyClosedBehavior.IGNORE via pdfiumandroid's global config, so that attempts to close already-closed resources are silently ignored instead of throwing.
    ```

- Upstream PR/issue: https://github.com/wonday/react-native-pdf/issues/976, https://github.com/wonday/react-native-pdf/issues/882, https://github.com/wonday/react-native-pdf/issues/830, https://github.com/wonday/react-native-pdf/pull/999
- E/App issue: https://github.com/Expensify/App/issues/82570
- PR introducing patch: https://github.com/Expensify/App/pull/82628


### [react-native-pdf+7.0.2+003+disable-topchange-coalescing-android.patch](react-native-pdf+7.0.2+003+disable-topchange-coalescing-android.patch)

- Reason:

    ```
    This patch prevents Android Fabric from coalescing react-native-pdf's shared topChange events.

    react-native-pdf sends loadComplete and pageChanged through the same topChange event name. Under Fabric, TopChangeEvent inherited React Native's default coalescing behavior, so pageChanged could replace loadComplete for the same PDF view before JS received it. That broke the onLoadComplete contract for hidden PDF validation renders. Marking the event as non-coalescible preserves both native callbacks in JS without adding an app-level success fallback.
    ```

- Upstream PR/issue: https://github.com/wonday/react-native-pdf/issues/1009, https://github.com/wonday/react-native-pdf/pull/1011
- E/App issue: https://github.com/Expensify/App/issues/81225
- PR introducing patch: https://github.com/Expensify/App/pull/87416


### [react-native-pdf+7.0.2+004+point-pdfiumandroid-to-already-closed-fix.patch](react-native-pdf+7.0.2+004+point-pdfiumandroid-to-already-closed-fix.patch)

- Reason:

    ```
    This patch completes the "Already closed" crash fix that patch 002 started.

    Patch 002 sets AlreadyClosedBehavior.IGNORE so a render that races with PDF view teardown is ignored instead of throwing. That config is only honored by pdfiumandroid methods that route their closed-state check through handleAlreadyClosed(). In io.legere:pdfiumandroid 1.0.35, PdfDocument.openPage()/openTextPage() are the only document methods that do NOT use that helper — they guard with an unconditional check(!isClosed) { "Already closed" } that always throws, regardless of the configured behavior. PdfiumCore.renderPageBitmap() calls openPage(), and the barteksc RenderingHandler only catches PageRenderingException, so the IllegalStateException is uncaught on the renderer thread and crashes the app.

    Since io.legere:pdfiumandroid is a published artifact (not vendored into node_modules), it cannot be patched with patch-package directly. Instead this patch makes react-native-pdf's Android build.gradle depend on a JitPack fork that makes openPage()/openTextPage() honor handleAlreadyClosed() like every other PdfDocument method, and excludes the io.legere:pdfiumandroid that com.github.zacharee:AndroidPdfViewer pulls in transitively. The exclude is required: the fork is published under a different Maven coordinate (com.github.Expensify:PdfiumAndroidKt) but ships the same io.legere.pdfiumandroid.* classes, so without it both the original (via AndroidPdfViewer) and the fork land on the classpath and the build fails :checkDuplicateClasses. AndroidPdfViewer links against the fork's identical classes unchanged. With IGNORE set, openPage()/openTextPage() return a page bound to the closed document whose operations all no-op via the existing doc.isClosed guards, so the closed-document render is silently dropped instead of crashing. The fork only changes Kotlin (the prebuilt native libs are unchanged) and should be raised upstream so the pin can eventually be dropped.
    ```

- Fork carrying the fix: https://github.com/Expensify/PdfiumAndroidKt/commit/e6c06c2905d1adf8b76f28c7440a2006033ca4c8 (tag `expensify-already-closed-fix-v1`)
- Upstream library: https://github.com/johngray1965/PdfiumAndroidKt
- E/App issue: https://github.com/Expensify/App/issues/93839
- PR introducing patch: https://github.com/Expensify/App/pull/94894
