import React from 'react';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

type SelectionListEmptyStateProps = {
    shouldShowLoadingPlaceholder: boolean | undefined;
    customLoadingPlaceholder?: React.JSX.Element;
    shouldUseUserSkeletonView?: boolean;
    shouldShowListEmptyContent: boolean;
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
