// eslint-disable-next-line no-restricted-imports -- type-only; mirrors PressableRef's cross-platform host-instance union.
import type {Text as RNText, View} from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Web stub preserves the native signature so cross-platform callers compile.
function fireFocusEvent(_view: View | RNText): boolean {
    return true;
}

export default fireFocusEvent;
