import {toViewStyle} from '@libs/WebOnlyStyleUtils';

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

    dInlineBlock: toViewStyle({
        display: 'inline-block',
    }),

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
    dInline: toViewStyle({
        display: 'inline',
    }),

    /**
     * Web-only style.
     */
    dInlineFlex: toViewStyle({
        display: 'inline-flex',
    }),

    /**
     * Web-only style.
     */
    dBlock: toViewStyle({
        display: 'block',
    }),

    /**
     * Web-only style.
     */
    dGrid: toViewStyle({
        display: 'grid',
    }),
} satisfies Record<string, ViewStyle>;
