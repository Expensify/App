import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import TopBarWithLoadingBar from '@components/Navigation/TopBarWithLoadingBar';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';

import {useAppLoadSkeletonState} from '@hooks/useInFlightRequests';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {isMobile} from '@libs/Browser';
import {getSpan} from '@libs/telemetry/activeSpans';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import InboxTabSelector from './InboxTabSelector';
import SidebarLinksData from './SidebarLinksData';

const hasAnyReportSelector = (reports: OnyxCollection<Report>): boolean => Object.keys(reports ?? {}).length > 0;

function BaseSidebarScreen() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    // HAS_LOADED_APP is written through queueFlushedData, which is held in memory until the sequential queue
    // flushes, so an interrupted session (e.g. the auto-reload after a deploy) can boot without it. reconnectApp
    // then delegates to openApp, and every gate in useAppLoadSkeletonState keys off `!hasLoadedApp` — so the
    // sidebar skeletons over reports that are already sitting in Onyx. Cached reports are the direct answer to
    // "can we render?", so they suppress the skeleton regardless of how the loading flags ended up.
    const [hasReportData = false] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: hasAnyReportSelector});
    const {shouldShowSkeleton, isAppLoadPending, hasLoadedApp, isLoadingHasLoadedApp, isColdRestartRecoveryFallback} = useAppLoadSkeletonState({hasCachedData: hasReportData});

    // Tag an in-flight inbox-tab navigation span when the app-loading skeleton is shown instead of the
    // report list, so durations that include the openApp wait can be queried separately in Sentry.
    useEffect(() => {
        if (!shouldShowSkeleton) {
            return;
        }
        getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB)?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_SKELETON_SHOWN, true);
    }, [shouldShowSkeleton]);

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
                                reasonAttributes={
                                    {
                                        context: 'BaseSidebarScreen',
                                        isAppLoadPending,
                                        hasLoadedApp,
                                        isLoadingHasLoadedApp,
                                        isColdRestartRecoveryFallback,
                                        hasReportData,
                                    } satisfies SkeletonSpanReasonAttributes
                                }
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
