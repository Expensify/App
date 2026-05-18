# `react-native-google-places-autocomplete` patches

### [react-native-google-places-autocomplete+2.5.6+001+react-19-support.patch](react-native-google-places-autocomplete+2.5.6+001+react-19-support.patch)

- Reason:
  
    ```
    This patch supports for React 19 by removing propTypes.
    ```
  
- Upstream PR/issue: https://github.com/FaridSafi/react-native-google-places-autocomplete/pull/970
- E/App issue: https://github.com/Expensify/App/issues/57511
- PR introducing patch: https://github.com/Expensify/App/pull/60421

### [react-native-google-places-autocomplete+2.5.6+002+keyboard-navigation.patch](react-native-google-places-autocomplete+2.5.6+002+keyboard-navigation.patch)

- Reason:

    ```
    This patch adds keyboard accessibility to autocomplete result rows.
    The row Pressable elements lacked tabIndex, making them unreachable
    via Tab key navigation. When tabbing from the text input, focus would
    leave the container, triggering onBlur which hid the list before any
    selection could occur. Adding tabIndex={0}, accessible,
    accessibilityRole="button", and a Space onKeyDown handler makes rows
    keyboard-focusable and selectable. The accessibilityRole="button" is
    critical: it causes useActiveElementRole to return "button" when a row
    is focused, which disables the form's pressOnEnter keyboard shortcut
    (via shouldDisableEnterShortcut in Button) so Enter reaches the row's
    own onPress handler instead of submitting the form. Space is handled
    via onKeyDown to also prevent page scroll.
    ```

- E/App issue: https://github.com/Expensify/App/issues/79621