# `react-native-web` patches

### [react-native-web+0.20.0+001+initial.patch](react-native-web+0.20.0+001+initial.patch)

- Reason:
  
    ```
    It applies several fixes to inverted lists, which are used in some places in E/App.
    ```
  
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/24482

### [react-native-web+0.20.0+002+fixLastSpacer.patch](react-native-web+0.20.0+002+fixLastSpacer.patch)

- Reason:
  
    ```
    Fixes VirtualizedList logic to only apply tail spacer constraints when the spacer is actually at the end of the list.
    ```
  
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/32843

### [react-native-web+0.20.0+003+image-header-support.patch](react-native-web+0.20.0+003+image-header-support.patch)

- Reason:
  
    ```
    Adds support for Image component with HTTP headers.
    ```
  
- Upstream PR/issue: https://github.com/necolas/react-native-web/pull/2442
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/13036

### [react-native-web+0.20.0+004+fixPointerEventDown.patch](react-native-web+0.20.0+004+fixPointerEventDown.patch)

- Reason:
  
    ```
    Fixes JS console error when right-clicking in the App.
    ```
  
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/38494

### [react-native-web+0.20.0+005+osr-improvement.patch](react-native-web+0.20.0+005+osr-improvement.patch)

- Reason:
  
    ```
    Fixes `onStartReached` callback being triggered more than it should due to re-triggering on list content size change.
    ```
  
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR introducing patch: 

### [react-native-web+0.20.0+006+remove-focus-trap-from-modal.patch](react-native-web+0.20.0+006+remove-focus-trap-from-modal.patch)

- Reason:
  
    ```
    Removes the library's focus trap implementation so the App can have its own, allowing it to have custom implementation and fixes.
    ```
  
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/39520

### [react-native-web+0.20.0+007+fix-scrollable-overflown-text.patch](react-native-web+0.20.0+007+fix-scrollable-overflown-text.patch)

- Reason:
  
    ```
    Changes Text component's multiline `overflow` property to clip instead of hiding, thus forbidding scrolling entirely through any mechanism and preventing issues when selecting clipped text.
    ```
  
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/47532

### [react-native-web+0.20.0+008+fix-nested-flatlist-scroll-on-web.patch](react-native-web+0.20.0+008+fix-nested-flatlist-scroll-on-web.patch)

- Reason:
  
    ```
    Adds a logic to conditionally call `preventDefault()` only on the scroll container that matches the gesture’s axis (and nesting/inversion state), instead of unconditionally, so nested FlatLists — especially orthogonal (H-in-V or V-in-H) and inverted — can both receive events and scroll correctly.
    ```
  
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/60174

### [react-native-web+0.20.0+009+fix-two-direction-scroll-on-web.patch](react-native-web+0.20.0+009+fix-two-direction-scroll-on-web.patch)

- Reason:
  
    ```
    Ensures that web implementation of inverted FlatList scrolls in only one direction at a time by comparing X and Y deltas, then choosing the direction with the bigger delta.
    ```
  
- Upstream PR/issue: 🛑
- E/App issue: 🛑
- PR introducing patch: https://github.com/Expensify/App/pull/60340

### [react-native-web+0.20.0+010+fullstory-support.patch](react-native-web+0.20.0+010+fullstory-support.patch)

- Reason:
  
    ```
    Adds support for Fullstory props to `Text`, `TextInput`, `TouchableWithoutFeedback` and `View` components, eliminating the need to use hacky workarounds to apply Fullstory masking/metadata properties to them.
    ```
  
- Upstream PR/issue: The patch isn't something we can apply to upstream because we are specifically allowing custom props used by Fullstory to be forwarded to their respective DOM elements.
- E/App issue: As explained above the current solution can't be applied to upstream because it's tailored to Fullstory needs.
- PR introducing patch: https://github.com/Expensify/App/pull/67552
