import type React from 'react';

type ScrollAwayHeaderContainerHandle = {
    /** Fed every scroll of the results list, so reaching its top can bring the header back. */
    onListScroll: (offset: number) => void;
};

type ScrollAwayHeaderContainerProps = {
    /** Whether the header scrolls away with the list area. When false, only the list area is rendered, as a plain flex view. */
    isEnabled: boolean;

    /** The page header that scrolls away. Not rendered while disabled, where the page pins its own header instead. */
    header: React.ReactNode;

    /** The list area: the results list, or whatever the page renders in its place. */
    children: React.ReactNode;

    ref?: React.Ref<ScrollAwayHeaderContainerHandle>;
};

export type {ScrollAwayHeaderContainerHandle, ScrollAwayHeaderContainerProps};
