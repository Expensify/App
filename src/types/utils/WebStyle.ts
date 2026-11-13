/**
 * Style types for web-only styles whose values React Native's own types reject, such as `display: 'grid'`,
 * `position: 'fixed'` or CSS sizes like `calc(100vh - 120px)`. react-native-web passes them through to the DOM.
 *
 * React Native declares these keys with narrower unions, and module augmentation can only add keys, never widen the
 * type of a key React Native already declares. So a web-only style is typed with one of these types and handed to
 * React Native through `toViewStyle` or `toTextStyle` from `@libs/WebOnlyStyleUtils`.
 */
import type {TextStyle, ViewStyle} from 'react-native';
import type {WebStyle} from 'react-native-web';

type WebWidenedStyleKey =
    | 'display'
    | 'height'
    | 'left'
    | 'lineHeight'
    | 'maxHeight'
    | 'maxWidth'
    | 'overflow'
    | 'paddingLeft'
    | 'paddingRight'
    | 'position'
    | 'top'
    | 'verticalAlign'
    | 'width';

/** Keeps React Native's own values for each widened key, so a React Native style can be spread into a web style */
type WidenToWebStyle<Style> = Omit<Style, WebWidenedStyleKey> & {
    [Key in WebWidenedStyleKey]?: (Key extends keyof Style ? Style[Key] : never) | WebStyle[Key];
};

type WebOnlyViewStyle = WidenToWebStyle<ViewStyle>;

type WebOnlyTextStyle = WidenToWebStyle<TextStyle>;

export type {WebOnlyTextStyle, WebOnlyViewStyle};
