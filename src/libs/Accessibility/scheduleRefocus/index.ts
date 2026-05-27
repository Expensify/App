import type {RefObject} from 'react';
// eslint-disable-next-line no-restricted-imports -- type-only; mirrors PressableRef's cross-platform host-instance union.
import type {Text as RNText, View} from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function scheduleRefocus(_ref: RefObject<View | RNText | null>): {cancel: () => void} {
    return {cancel: () => {}};
}

export default scheduleRefocus;
