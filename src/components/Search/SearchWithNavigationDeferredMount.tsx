import type {ComponentProps} from 'react';
import React from 'react';
import NavigationDeferredMount from '@components/NavigationDeferredMount';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {endSpanWithAttributes} from '@libs/telemetry/activeSpans';
import {endNavigateToReportsFirstPaint} from '@libs/telemetry/navigateToReportsSpans';
import {endSubmitFollowUpActionSpan, getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import CONST from '@src/CONST';
import Search from './index';

const REASON_ATTRIBUTES = {context: 'SearchPage.NavigationDeferred'} as const;

function handleSkeletonLayout() {
    endSpanWithAttributes(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS, {[CONST.TELEMETRY.ATTRIBUTE_IS_WARM]: true});
    endNavigateToReportsFirstPaint(CONST.TELEMETRY.NAVIGATE_TO_REPORTS_START_TYPE.WARM_FIRST);

    // Skeleton paint is the first user-perceivable signal that the submit destination
    // (Search) is up. End the submit-to-destination-visible span here for any pending
    // action that targets Search. DISMISS_MODAL_AND_OPEN_REPORT is excluded because
    // that flow's destination is the report, not Search.
    const pending = getPendingSubmitFollowUpAction();
    if (pending && pending.followUpAction !== CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT) {
        endSubmitFollowUpActionSpan(pending.followUpAction, undefined, {[CONST.TELEMETRY.ATTRIBUTE_IS_WARM]: true});
    }
}

function SearchWithNavigationDeferredMount(props: ComponentProps<typeof Search>) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const containerStyle = shouldUseNarrowLayout ? styles.searchListContentContainerStyles(!!props.hasFilterBars) : undefined;

    return (
        <NavigationDeferredMount
            waitForUpcomingTransition={false}
            placeholder={
                <SearchRowSkeleton
                    shouldAnimate
                    onLayout={handleSkeletonLayout}
                    containerStyle={containerStyle}
                    reasonAttributes={REASON_ATTRIBUTES}
                />
            }
        >
            <Search {...props} />
        </NavigationDeferredMount>
    );
}

export default SearchWithNavigationDeferredMount;
