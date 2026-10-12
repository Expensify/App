import type {ViewStyle} from 'react-native';

import overflowAuto from './overflowAuto';
import overflowXAuto from './overflowXAuto';
import overflowXHidden from './overflowXHidden';
import overscrollBehaviorContain from './overscrollBehaviorContain';

/**
 * Overflow utility styles with Bootstrap inspired naming.
 *
 * https://getbootstrap.com/docs/5.0/utilities/overflow/
 */
export default {
    overflowHidden: {
        overflow: 'hidden',
    },

    overflowVisible: {
        overflow: 'visible',
    },

    overflowScroll: {
        overflow: 'scroll',
    },

    overscrollBehaviorNone: {
        overscrollBehavior: 'none',
    },

    overscrollBehaviorXNone: {
        overscrollBehaviorX: 'none',
    },

    overflowXHidden,

    overflowXAuto,

    overscrollBehaviorContain,

    overflowAuto,
} satisfies Record<string, ViewStyle>;
