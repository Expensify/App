// Web: focus is moved by `element.focus()` directly elsewhere; this helper is a no-op so cross-platform consumers can call it unconditionally.
// eslint-disable-next-line no-restricted-imports -- type-only; mirrors PressableRef's cross-platform host-instance union.
import type {Text as RNText, View} from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function fireFocusEvent(_view: View | RNText): void {}

export default fireFocusEvent;
