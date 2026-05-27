// Web uses `element.focus()` directly; this is the cross-platform no-op.
// eslint-disable-next-line no-restricted-imports -- type-only; mirrors PressableRef's cross-platform host-instance union.
import type {Text as RNText, View} from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function fireFocusEvent(_view: View | RNText): void {}

export default fireFocusEvent;
