import type ChildrenProps from '@src/types/utils/ChildrenProps';

type SearchTabContextHoldProps = ChildrenProps & {
    /** Whether the idle preload marked the Spend tab and it has not been opened since. */
    isInPreloadedTab: boolean;

    /** Whether the preloaded Spend tab has its first content on screen. */
    isPreloadedContentReady: boolean;
};

export default SearchTabContextHoldProps;
