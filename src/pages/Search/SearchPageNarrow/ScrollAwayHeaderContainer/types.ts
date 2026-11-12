import type React from 'react';

type ScrollAwayHeaderContainerHandle = {
    /** Fed every scroll of the results list, so reaching its top can bring the header back. */
    onListScroll: (offset: number) => void;
};

type ScrollAwayHeaderContainerProps = {
    /**
     * Whether the header scrolls away with the list area. When false, the list area fills the outer scroller by flex
     * with no header above it, so there is nothing to scroll. The tree keeps its shape either way, so toggling this
     * (e.g. on rotation) doesn't remount the list area.
     */
    isEnabled: boolean;

    /** The page header that scrolls away. Not rendered while disabled, where the page pins its own header instead. */
    header: React.ReactNode;

    /** The list area: the results list, or whatever the page renders in its place. */
    children: React.ReactNode;

    ref?: React.Ref<ScrollAwayHeaderContainerHandle>;
};

export type {ScrollAwayHeaderContainerHandle, ScrollAwayHeaderContainerProps};
