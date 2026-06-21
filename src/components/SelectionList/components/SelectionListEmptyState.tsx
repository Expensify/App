import React from 'react';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

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
    /** Telemetry context identifying which list rendered the skeleton */
    context: string;
};

/** Renders a SelectionList's loading skeleton or empty-state content. */
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
        };
        // Only the flat list forwards this; omit it for the sectioned list so its span attributes match those before the extraction.
        if (shouldUseUserSkeletonView !== undefined) {
            reasonAttributes.shouldUseUserSkeletonView = shouldUseUserSkeletonView;
        }
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
