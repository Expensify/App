import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import TopBarWithLoadingBar from '@components/Navigation/TopBarWithLoadingBar';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {isMobile} from '@libs/Browser';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import InboxTabSelector from './InboxTabSelector';
import SidebarLinksData from './SidebarLinksData';

// Reduce the report collection to a single boolean so the subscription only re-renders when reports
// first appear (or the cache is emptied), rather than on every report update.
const hasAnyReportSelector = (reports: OnyxCollection<Report>): boolean => Object.keys(reports ?? {}).length > 0;

// Once the app finishes loading for the first time, we never show the skeleton again
// (even if isLoadingApp briefly flips back to true during a reconnect).
// This uses a module-level variable + connectWithoutView instead of a ref because
// a ref resets on unmount, so the skeleton would flash again when the component
// remounts (e.g. navigating between tabs).
let hasEverFinishedLoading = false;
Onyx.connectWithoutView({
    key: ONYXKEYS.IS_LOADING_APP,
    callback: (value) => {
        if (value !== false) {
            return;
        }
        hasEverFinishedLoading = true;
    },
});

function BaseSidebarScreen() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    // When report data is already cached in Onyx (e.g. after a deploy refresh or tab switch), skip the
    // full-page skeleton and mount SidebarLinksData immediately. Its inner cache-aware gate
    // (isLoadingReportData && !hasReportData) then handles any residual loading state without a flash.
    const [hasReportData = false] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: hasAnyReportSelector});
    const shouldShowSkeleton = isLoadingApp && !hasEverFinishedLoading && !hasReportData;

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            style={[styles.sidebar, isMobile() ? styles.userSelectNone : {}]}
            testID="BaseSidebarScreen"
            bottomContent={<TabBarBottomContent selectedTab={NAVIGATION_TABS.INBOX} />}
            bottomContentStyle={styles.overflowVisible}
        >
            {({insets}) => (
                <>
                    <TopBarWithLoadingBar
                        breadcrumbLabel={translate('common.inbox')}
                        shouldDisplaySearch={shouldUseNarrowLayout}
                        shouldDisplayHelpButton={shouldUseNarrowLayout}
                    />
                    {!shouldShowSkeleton && <InboxTabSelector />}
                    <View style={[styles.flex1]}>
                        {shouldShowSkeleton ? (
                            <OptionsListSkeletonView
                                shouldAnimate
                                reasonAttributes={{context: 'BaseSidebarScreen', isLoadingApp, hasEverFinishedLoading, hasReportData} satisfies SkeletonSpanReasonAttributes}
                            />
                        ) : (
                            <SidebarLinksData insets={insets} />
                        )}
                    </View>
                </>
            )}
        </ScreenWrapper>
    );
}

export default BaseSidebarScreen;
