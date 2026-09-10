import NavigationDeferredMount from '@components/NavigationDeferredMount';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {endSpanWithAttributes} from '@libs/telemetry/activeSpans';
import {endNavigateToReportsFirstPaint} from '@libs/telemetry/navigateToReportsSpans';
import {endSubmitFollowUpActionSpan, getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';

import CONST from '@src/CONST';

import type {ComponentProps} from 'react';

import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';

import Search from './index';

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

type SearchWithNavigationDeferredMountProps = ComponentProps<typeof Search> & {
    /** True when this mount replaces results already on screen, which renders the placeholder invisibly. */
    isReplacingContent?: boolean;
};

function SearchWithNavigationDeferredMount({isReplacingContent = false, ...props}: SearchWithNavigationDeferredMountProps) {
    // Captured once: the prop is derived from usePrevious, so it flips back on the render after the query changes,
    // while this placeholder can still be showing. Reading it live makes the skeleton appear partway through hydrate.
    const [isReplacingContentAtMount] = useState(isReplacingContent);
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const containerStyle = shouldUseNarrowLayout ? styles.searchListContentContainerStyles(!!props.hasFilterBars) : undefined;

    return (
        <NavigationDeferredMount
            waitForUpcomingTransition={false}
            placeholder={
                // Rendered invisibly rather than skipped when it replaces results already on screen: its onLayout still
                // ends the navigate-to-Search spans, and the deferred mount still yields to the press.
                <View style={[styles.flex1, StyleSheet.absoluteFill, isReplacingContentAtMount && styles.opacity0]}>
                    <SearchRowSkeleton
                        shouldAnimate
                        onLayout={handleSkeletonLayout}
                        containerStyle={containerStyle}
                    />
                </View>
            }
        >
            <Search {...props} />
        </NavigationDeferredMount>
    );
}

export default SearchWithNavigationDeferredMount;
