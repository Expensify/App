import {CSSProperties} from 'react';
import overflowAuto from './overflowAuto';
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

    overscrollBehaviorXNone: {
        overscrollBehaviorX: 'none',
    },

    overscrollBehaviorContain,

    overflowAuto,
} satisfies Record<string, CSSProperties>;
