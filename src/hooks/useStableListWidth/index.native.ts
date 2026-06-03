import type StableListWidthResult from './types';

/**
 * Native uses overlay scrollbars and isn't affected by the web-only FlashList scrollbar layout loop,
 * so there's no need to pin a fixed content width. This is a no-op that leaves the list's content
 * container at its natural width.
 */
export default function useStableListWidth(): StableListWidthResult {
    return {stableListWidth: undefined, onStableListLayout: () => {}};
}
