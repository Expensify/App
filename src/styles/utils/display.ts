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

    /**
     * Web-only style.
     */
    dInline: {
        // NOTE: asserting "display" to a valid type, because it isn't possible to augment "display".
        display: 'inline' as ViewStyle['display'],
    },

    /**
     * Web-only style.
     */
    dInlineFlex: {
        // NOTE: asserting "display" to a valid type, because it isn't possible to augment "display".
        display: 'inline-flex' as ViewStyle['display'],
    },

    /**
     * Web-only style.
     */
    dBlock: {
        // NOTE: asserting "display" to a valid type, because it isn't possible to augment "display".
        display: 'block' as ViewStyle['display'],
    },

    /**
     * Web-only style.
     */
    dGrid: {
        // NOTE: asserting "display" to a valid type, because it isn't possible to augment "display".
        display: 'grid' as ViewStyle['display'],
    },
} satisfies Record<string, ViewStyle>;
