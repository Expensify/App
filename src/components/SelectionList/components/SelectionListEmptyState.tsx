import OptionsListSkeletonView from '@components/OptionsListSkeletonView';

import React from 'react';

type SelectionListEmptyStateProps = {
    shouldShowLoadingPlaceholder: boolean | undefined;
    customLoadingPlaceholder?: React.JSX.Element;
    shouldUseUserSkeletonView?: boolean;
    shouldShowListEmptyContent: boolean;
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
