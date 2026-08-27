import OptionsListSkeletonView from '@components/OptionsListSkeletonView';

import React from 'react';

type SelectionListEmptyStateProps = {
    /** Whether to show the loading placeholder */
    shouldShowLoadingPlaceholder: boolean | undefined;
    /** Custom component to render while data is loading */
    customLoadingPlaceholder?: React.JSX.Element;
    /** Whether to use the user skeleton view */
    shouldUseUserSkeletonView?: boolean;
    /** Whether to show the empty list content */
    shouldShowListEmptyContent: boolean;
    /** Custom content to display when the list is empty */
    listEmptyContent: React.JSX.Element | null | undefined;
};

/** Renders a SelectionList's loading skeleton or empty-state content. */
function SelectionListEmptyState({
    shouldShowLoadingPlaceholder,
    customLoadingPlaceholder,
    shouldUseUserSkeletonView,
    shouldShowListEmptyContent,
    listEmptyContent,
}: SelectionListEmptyStateProps) {
    if (shouldShowLoadingPlaceholder) {
        return customLoadingPlaceholder ?? <OptionsListSkeletonView shouldStyleAsTable={shouldUseUserSkeletonView} />;
    }
    if (shouldShowListEmptyContent) {
        return listEmptyContent ?? null;
    }
    return null;
}

export default SelectionListEmptyState;
