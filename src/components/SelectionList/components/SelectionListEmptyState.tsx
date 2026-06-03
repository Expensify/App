import React from 'react';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

type SelectionListEmptyStateProps = {
    /** Whether to render the loading skeleton */
    shouldShowLoadingPlaceholder: boolean | undefined;

    /** Custom placeholder rendered instead of the default skeleton while loading */
    customLoadingPlaceholder?: React.JSX.Element;

    /** Styles the skeleton as a table (user-list layout) */
    shouldUseUserSkeletonView?: boolean;

    /** Whether to render the empty content when not loading */
    shouldShowListEmptyContent: boolean;

    /** Content shown when the list is empty */
    listEmptyContent: React.JSX.Element | null | undefined;

    /** Telemetry context describing where the skeleton renders */
    context: string;
};

/**
 * Renders a SelectionList's loading skeleton or empty-state content. Shared by BaseSelectionList
 * (flat) and BaseSelectionListWithSections (sectioned).
 */
function SelectionListEmptyState({
    shouldShowLoadingPlaceholder,
    customLoadingPlaceholder,
    shouldUseUserSkeletonView,
    shouldShowListEmptyContent,
    listEmptyContent,
    context,
}: SelectionListEmptyStateProps) {
    if (shouldShowLoadingPlaceholder) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {
            context,
            shouldShowLoadingPlaceholder,
            shouldUseUserSkeletonView,
        };
        return (
            customLoadingPlaceholder ?? (
                <OptionsListSkeletonView
                    shouldStyleAsTable={shouldUseUserSkeletonView}
                    reasonAttributes={reasonAttributes}
                />
            )
        );
    }
    if (shouldShowListEmptyContent) {
        return listEmptyContent ?? null;
    }
    return null;
}

export default SelectionListEmptyState;
