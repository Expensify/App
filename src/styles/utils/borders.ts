import {ViewStyle} from 'react-native';

/**
 * All styles should be incremented by units of 4.
 */
export default {
    br0: {
        borderRadius: 0,
    },

    br2: {
        borderRadius: 8,
    },

    br4: {
        borderRadius: 16,
    },
} satisfies Record<string, ViewStyle>;
