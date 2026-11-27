import NavigationDeferredMount from '@components/NavigationDeferredMount';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';

import useIsInPreloadedTab from '@hooks/useIsInPreloadedTab';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchListContentContainerStyle from '@hooks/useSearchListContentContainerStyle';
import useThemeStyles from '@hooks/useThemeStyles';

import {endSpanWithAttributes} from '@libs/telemetry/activeSpans';
import {endNavigateToReportsFirstPaint} from '@libs/telemetry/navigateToReportsSpans';
import {endSubmitFollowUpActionSpan, getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';

import CONST from '@src/CONST';

import type {ComponentProps} from 'react';

import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';

import Search from './index';
import {useIsCoveredByPreviousSearchResults} from './SearchResultsSwap';

type SearchWithNavigationDeferredMountProps = ComponentProps<typeof Search> & {
    /** Whether this mount is swapping in over content that is already on screen, rather than filling an empty page. */
    isReplacingContent?: boolean;
};

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

function SearchWithNavigationDeferredMount({isReplacingContent, ...props}: SearchWithNavigationDeferredMountProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const searchListContentContainerStyle = useSearchListContentContainerStyle(!!props.hasFilterBars);
    const containerStyle = shouldUseNarrowLayout ? searchListContentContainerStyle : undefined;
    // Laid out during the idle preload while nobody sees it, so it must not end the spans of a tap or submit made elsewhere.
    const isInPreloadedTab = useIsInPreloadedTab();

    // Read once at mount: the placeholder only ever covers this mount's deferral window, so a later prop change must
    // not un-hide it mid-swap.
    const [isReplacingContentAtMount] = useState(isReplacingContent);
    const isCoveredByPreviousResults = useIsCoveredByPreviousSearchResults();
    const [isCoveredAtMount] = useState(isCoveredByPreviousResults);

    return (
        <NavigationDeferredMount
            waitForUpcomingTransition={false}
            placeholder={
                <View style={[styles.flex1, StyleSheet.absoluteFill, isReplacingContentAtMount && styles.opacity0]}>
                    <SearchRowSkeleton
                        shouldAnimate
                        // The user still sees the previous results while it is covered, so its layout is not a paint of Search.
                        onLayout={isInPreloadedTab || isCoveredAtMount ? undefined : handleSkeletonLayout}
                        containerStyle={containerStyle}
                    />
                </View>
            }
        >
            {isCoveredAtMount ? (
                // The previous results stay on screen until these lay out, so a fade would start from an empty list.
                <Search {...props} />
            ) : (
                <Animated.View
                    entering={FadeIn.duration(CONST.SEARCH.ANIMATION.FADE_DURATION)}
                    style={styles.flex1}
                >
                    <Search {...props} />
                </Animated.View>
            )}
        </NavigationDeferredMount>
    );
}

export default SearchWithNavigationDeferredMount;
