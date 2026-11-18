import {toViewStyle} from '@libs/WebOnlyStyleUtils';

import type OverflowAutoStyles from './types';

/**
 * Web-only style.
 */
const overflowAuto: OverflowAutoStyles = toViewStyle({
    overflow: 'auto',
});

export default overflowAuto;
