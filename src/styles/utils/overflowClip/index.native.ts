import type OverflowClipStyles from './types';

/** Native has no `clip`, and no sticky positioning for a hidden overflow to get in the way of. */
const overflowClip: OverflowClipStyles = {
    overflow: 'hidden',
};

export default overflowClip;
