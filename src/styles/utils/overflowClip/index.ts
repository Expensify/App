import {toViewStyle} from '@libs/WebOnlyStyleUtils';

import type OverflowClipStyles from './types';

/** Clips like `hidden` without making the box a scroller, which a sticky descendant would stick to instead of the table's. */
const overflowClip: OverflowClipStyles = toViewStyle({overflow: 'clip'});

export default overflowClip;
