/**
 * Hands web-only styles to React Native's style props. react-native-web renders values such as `display: 'grid'`,
 * `position: 'fixed'` or `calc(100vh - 120px)`, but React Native's types reject them, and module augmentation can't
 * widen them (see `src/types/utils/WebStyle.ts`). These functions return their argument unchanged and are the one place
 * that asserts a web value to the React Native type, so every web-only value is marked where it is written.
 */
import type {WebOnlyTextStyle, WebOnlyViewStyle} from '@src/types/utils/WebStyle';

import type {DimensionValue, TextStyle, ViewStyle} from 'react-native';

/** Types a size that may be a CSS expression such as `calc()`, `min()` or a `var()` reference, which react-native-web passes through */
function toDimensionValue(size: number | string): DimensionValue {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- react-native-web renders CSS size expressions, React Native's DimensionValue doesn't declare them
    return size as DimensionValue;
}

function toViewStyle(style: WebOnlyViewStyle): ViewStyle {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- react-native-web renders these CSS values, React Native's style types don't declare them
    return style as ViewStyle;
}

function toTextStyle(style: WebOnlyTextStyle): TextStyle {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- react-native-web renders these CSS values, React Native's style types don't declare them
    return style as TextStyle;
}

export {toDimensionValue, toTextStyle, toViewStyle};
