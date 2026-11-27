import type StatusRingHeaderLayout from './types';

/**
 * Only the iPhone Duo's inner panel puts the status bar in a corner of a tall top inset, so on every other platform
 * headers stay below the top inset.
 */
function useStatusRingHeaderLayout(): StatusRingHeaderLayout | undefined {
    return undefined;
}

export default useStatusRingHeaderLayout;
