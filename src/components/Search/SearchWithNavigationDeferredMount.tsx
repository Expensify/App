import type {ComponentProps} from 'react';
import React from 'react';
import NavigationDeferredMount from '@components/NavigationDeferredMount';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {endSpanWithAttributes} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';
import Search from './index';

const REASON_ATTRIBUTES = {context: 'SearchPage.NavigationDeferred'} as const;

function SearchWithNavigationDeferredMount(props: ComponentProps<typeof Search>) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const containerStyle = shouldUseNarrowLayout ? styles.searchListContentContainerStyles(!!props.hasFilterBars) : styles.mt3;

    return (
        <NavigationDeferredMount
            waitForUpcomingTransition={false}
            placeholder={
                <SearchRowSkeleton
                    shouldAnimate
                    onLayout={() => endSpanWithAttributes(CONST.TELEMETRY.SPAN_NAVIGATE_TO_REPORTS, {[CONST.TELEMETRY.ATTRIBUTE_IS_WARM]: true})}
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
