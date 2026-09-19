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
import Animated, {FadeIn} from 'react-native-reanimated';

import Search from './index';

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
    const containerStyle = shouldUseNarrowLayout ? styles.searchListContentContainerStyles(!!props.hasFilterBars) : undefined;

    // Read once at mount: the placeholder only ever covers this mount's deferral window, so a later prop change must
    // not un-hide it mid-swap.
    const [isReplacingContentAtMount] = useState(isReplacingContent);

    return (
        <NavigationDeferredMount
            waitForUpcomingTransition={false}
            placeholder={
                // Absolutely filled so it overlays the incoming Search content rather than stacking in the parent's
                // column layout. When results are already on screen it stays mounted but invisible, so its onLayout
                // telemetry still fires without flashing a skeleton over content the user can already see.
                <View style={[styles.flex1, StyleSheet.absoluteFill, isReplacingContentAtMount && styles.opacity0]}>
                    <SearchRowSkeleton
                        shouldAnimate
                        onLayout={handleSkeletonLayout}
                        containerStyle={containerStyle}
                    />
                </View>
            }
        >
            {/* The fade lives here rather than on the parent layer because NavigationDeferredMount hydrates a frame or
                more after that layer mounts. Animating the layer would run the fade against the placeholder and leave
                the results to pop in at full opacity once they finally mount. */}
            <Animated.View
                entering={FadeIn.duration(CONST.SEARCH.ANIMATION.FADE_DURATION)}
                style={styles.flex1}
            >
                <Search {...props} />
            </Animated.View>
        </NavigationDeferredMount>
    );
}

export default SearchWithNavigationDeferredMount;
