# `react-native-google-places-autocomplete` patches

### [react-native-google-places-autocomplete+2.6.4+001+fix-tdz-crash.patch](react-native-google-places-autocomplete+2.6.4+001+fix-tdz-crash.patch)

- Reason:

    ```
    Fixes TDZ crashes and reorders forward-referenced declarations in v2.6.4:

    1. `useRef(_request)` on line 161 references `_request` before its `const`
       declaration on line 466, causing
       `ReferenceError: Cannot access '_request' before initialization`.
       Fix: replace the initial value with `null` (safe because
       `requestRef.current` is reassigned to `_request` every render before
       it can be invoked).

    2. `_disableRowLoaders` (a `const useCallback`) was declared on line 653
       but referenced in the `useCallback` dependency arrays of
       `_requestNearby` (line 450) and `getCurrentLocation` (line 629),
       causing `ReferenceError: Cannot access '_disableRowLoaders' before
       initialization`. Fix: move `_disableRowLoaders` above
       `_requestNearby` so it is defined before first use.

    3. Several functions were declared after their callers, creating forward
       references. While these only execute lazily (not during render), they
       are reordered for clarity and consistency:
       - `_renderDescription`, `hideListView`, `isNewFocusInAutocompleteResultList`,
         `_onBlur`, `_onFocus` moved before `_onPress` (which calls them).
       - `debounceData` moved before `_onChangeText` (which calls it).

    4. v2.6.4 added `hideListView(true)` at the start of `_onPress` in the
       `fetchDetails` branch. This immediately hides the entire FlatList
       before `_enableRowLoader` can display the per-row loading spinner,
       causing the loading indicator to be invisible during place detail
       fetches. Fix: remove `hideListView(true)` from the `fetchDetails`
       branch of `_onPress`, restoring v2.5.6 behavior where the list
       stays visible with the row spinner until the detail request completes.
       The `hideListView(true)` calls in the `isCurrentLocation` and
       predefined-place branches are left intact since those don't need
       to show a row-level loading indicator.

    5. v2.6.4 changed the `_getFlatList` visibility condition from
       `stateText !== ''` (v2.5.6) to `dataSource.length > 0`. This
       prevents the FlatList from mounting when the user is typing but
       results haven't arrived yet, so the `ListEmptyComponent` loading
       spinner is never shown during in-flight requests. Fix: replace
       `dataSource.length > 0` with the v2.5.6-style condition
       `(stateText !== '' || predefinedPlaces.length > 0 || currentLocation === true)`
       so the FlatList renders while results are loading. This matches
       v2.5.6 production behavior where existing results stay visible
       while new results load — `_request` does NOT clear `dataSource`
       before sending the XHR, so previous results remain visible until
       the new response arrives.

    6. v2.6.4 added `stateText` to the dependency array of the
       query-change `useEffect` (the effect that reloads search when
       `props.query` changes). This causes the cleanup function
       (`_abortRequests`) to fire on every keystroke, aborting in-flight
       XHRs before results can arrive. When the user types fast, results
       from previous keystrokes never complete, `dataSource` stays empty,
       and the `ListEmptyComponent` loading spinner flashes on every key.
       Fix: remove `stateText` from the dependency array. Per-keystroke
       requests are already handled by `_onChangeText` → `debounceData`,
       and `_request` itself calls `_abortRequests()` at the top, so old
       requests are properly aborted when a new one fires.

    7. In v2.6.4, `requestsRef` is a `useRef` that persists across renders
       (unlike v2.5.6 where `_requests` was a plain `let` re-initialized
       every render). This means `_abortRequests()` inside `_request` now
       actually aborts the previous in-flight XHR. When the user types
       faster than the API responds, each keystroke aborts the prior XHR
       before it populates `dataSource`, keeping `dataSource` empty and
       causing `ListEmptyComponent` to show the loading spinner on every
       keystroke. Fix: only call `setListLoaderDisplayed(true)` in the
       `onreadystatechange` handler when `resultsRef.current.length === 0`
       (i.e., no prior results exist). When prior results already exist
       they remain visible in the FlatList while the new request is
       in-flight, matching v2.5.6 production behavior. Applied to both
       `_request` and `_requestNearby`.

    8. When `resultsRef.current.length === 0` and the loading spinner is
       enabled, `dataSource` may still contain predefined places (populated
       by `buildRowsFromResults([])` when the user cleared the input).
       Since `ListEmptyComponent` only renders when `data` is empty,
       the loading spinner was invisible even though `listLoaderDisplayed`
       was true. Fix: call `setDataSource([])` alongside
       `setListLoaderDisplayed(true)` to clear stale predefined places
       from the FlatList data, allowing `ListEmptyComponent` to render
       the loading spinner. Applied to both `_request` and
       `_requestNearby`.

    9. v2.6.4 replaced `TouchableHighlight` with `Pressable` for suggestion
       rows AND added `onBlur={_onBlur}` to the Pressable. This causes two
       problems on iOS:
       (a) `Pressable` does not participate in the gesture responder system
       the same way `TouchableHighlight` does. When a parent `ScrollView`
       uses `keyboardShouldPersistTaps="handled"` (as `FormWrapper` does),
       `TouchableHighlight` counts as "handling" the tap so the keyboard
       stays up and `onPress` fires. `Pressable` does not, so the first
       tap dismisses the keyboard without firing `onPress`, making
       suggestion selection appear broken.
       (b) The `onBlur={_onBlur}` on the Pressable fires when the keyboard
       dismisses, calling `hideListView()` and `inputRef.current.blur()`,
       which cascades to AddressSearch collapsing the list to zero height.
       Fix: replace `Pressable` with `TouchableHighlight` (restoring v2.5.6
       behavior) and remove the `onBlur` handler. `TouchableHighlight` uses
       `underlayColor` for press feedback instead of function-style styles.
    ```

- Upstream PR/issue: 🛑, library is unmaintained (https://github.com/FaridSafi/react-native-google-places-autocomplete/issues/978)
- E/App issue: https://github.com/Expensify/App/pull/82233
- PR introducing patch: https://github.com/Expensify/App/pull/82233
