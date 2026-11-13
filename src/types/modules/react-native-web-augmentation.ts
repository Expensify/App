/**
 * Adds the DOM props and CSS properties that react-native-web accepts to React Native's types.
 *
 * @types/react-native-web used to merge its whole web type surface into React Native's types globally. That widened
 * properties React Native already declares (`display`, `position`, `fontSize`, ...), which the Strict TypeScript API
 * rejects. This adds back only the keys the app uses that React Native does not declare at all, with
 * react-native-web's own value types, so the same augmentation compiles on the legacy and the Strict API types.
 * Web values for keys React Native does declare go through `toViewStyle` or `toTextStyle` from
 * `@libs/WebOnlyStyleUtils` instead.
 *
 * This is a .ts file and not a .d.ts on purpose: skipLibCheck skips declaration files, which would hide a key that
 * conflicts with React Native's own declaration.
 */
import type {
    PressableStateCallbackType as WebPressableStateCallbackType,
    TextInputProps as WebTextInputProps,
    TextProps as WebTextProps,
    ViewProps as WebViewProps,
    WebStyle,
} from 'react-native-web';

type WebOnlyStyleKey =
    | 'appearance'
    | 'border'
    | 'colorScheme'
    | 'gridTemplateColumns'
    | 'justifyItems'
    | 'outline'
    | 'overflowAnchor'
    | 'overflowX'
    | 'overflowY'
    | 'overscrollBehavior'
    | 'overscrollBehaviorX'
    | 'scale'
    | 'scrollMarginInline'
    | 'scrollPadding'
    | 'scrollPaddingBottom'
    | 'scrollPaddingTop'
    | 'scrollSnapAlign'
    | 'scrollSnapStop'
    | 'textDecoration'
    | 'textDecorationSkipInk'
    | 'textOverflow'
    | 'textUnderlineOffset'
    | 'textUnderlinePosition'
    | 'transition'
    | 'visibility'
    | 'WebkitTouchCallout'
    | 'WebkitUserSelect'
    | 'whiteSpace'
    | 'willChange'
    | 'wordBreak';

type WebOnlyViewPropKey = 'accessibilityControls' | 'accessibilityHasPopup' | 'dataSet' | 'href' | 'hrefAttrs' | 'lang' | 'onMouseDown' | 'onMouseMove' | 'onMouseUp' | 'onWheel';

/**
 * React Native 0.88 declares these on View with its own event types, which conflict with react-native-web's DOM handler
 * types, so they only fit the legacy types. The handlers that use them move to React Native's event types as part of
 * https://github.com/Expensify/App/issues/101439.
 */
type WebEventPropKey = 'onClick' | 'onKeyDown' | 'onMouseEnter' | 'onMouseLeave';

/* eslint-disable @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-empty-object-type -- module augmentation merges into React Native's interfaces, which only an interface declaration can do */
/*
 * The web-only style keys are readonly because the Strict API's TextStyle and ImageStyle inherit them from a readonly
 * ViewStyle, and TypeScript requires a key that an interface inherits twice to be declared identically.
 */
declare module 'react-native' {
    interface ViewStyle extends Readonly<Pick<WebStyle, WebOnlyStyleKey>> {
        /*
         * Text keys the app sets on views, mostly through shared helpers like `textAlignCenter` and `userSelectNone`.
         * React Native ignores them on a view, react-native-web passes them to the view's DOM element. They keep React
         * Native's text value types, so they stay compatible with TextStyle on both the legacy and the Strict API types.
         */
        color?: TextStyle['color'];
        fontFamily?: TextStyle['fontFamily'];
        fontSize?: TextStyle['fontSize'];
        lineHeight?: TextStyle['lineHeight'];
        textAlign?: TextStyle['textAlign'];
        textDecorationLine?: TextStyle['textDecorationLine'];
        textDecorationStyle?: TextStyle['textDecorationStyle'];
        userSelect?: TextStyle['userSelect'];
    }
    interface TextStyle extends Readonly<Pick<WebStyle, WebOnlyStyleKey>> {}
    interface ImageStyle extends Readonly<Pick<WebStyle, WebOnlyStyleKey>> {}

    interface ViewProps extends Pick<WebViewProps, WebOnlyViewPropKey | WebEventPropKey> {}
    interface TextProps extends Pick<WebTextProps, WebOnlyViewPropKey | WebEventPropKey | 'tabIndex'> {}
    interface TextInputProps extends Pick<WebTextInputProps, 'disabled'> {}

    interface PressableStateCallbackType extends Pick<WebPressableStateCallbackType, 'focused' | 'hovered'> {}
}
/* eslint-enable @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-empty-object-type */
