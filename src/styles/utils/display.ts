import type {ViewStyle} from 'react-native';

/**
 * Display utilities with Bootstrap inspired naming.
 *
 * Note: Only some are acceptable states for use in React Native
 * do not add new styles here unless React Native has changed
 * to support them.
 *
 * RN: https://reactnative.dev/docs/0.62/layout-props#display
 * BS: https://getbootstrap.com/docs/5.0/utilities/display/
 */
export default {
    dFlex: {
        display: 'flex',
    },

    dNone: {
        display: 'none',
    },

    dInlineBlock: {
        display: 'inline-block',
    },

    /**
     * display: 'contents' - Supported in React Native 0.77+
     * Ref: https://reactnative.dev/blog/2025/01/21/version-0.77#simpler-layouts-with-display-contents
     */
    dContents: {
        display: 'contents',
    },

    /**
     * Web-only style.
     */
    dInline: {
        display: 'inline',
    },

    /**
     * Web-only style.
     */
    dInlineFlex: {
        display: 'inline-flex',
    },

    /**
     * Web-only style.
     */
    dBlock: {
        display: 'block',
    },

    /**
     * Web-only style.
     */
    dGrid: {
        display: 'grid',
    },
} satisfies Record<string, ViewStyle>;
