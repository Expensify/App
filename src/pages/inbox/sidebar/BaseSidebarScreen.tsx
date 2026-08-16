import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import TopBarWithLoadingBar from '@components/Navigation/TopBarWithLoadingBar';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';

import {useAppLoadSkeletonState} from '@hooks/useInFlightRequests';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {isMobile} from '@libs/Browser';
import {getSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import InboxTabSelector from './InboxTabSelector';
import SidebarLinksData from './SidebarLinksData';

function BaseSidebarScreen() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {shouldShowSkeleton} = useAppLoadSkeletonState();

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
                    <View style={[styles.flex1]}>{shouldShowSkeleton ? <OptionsListSkeletonView shouldAnimate /> : <SidebarLinksData insets={insets} />}</View>
                </>
            )}
        </ScreenWrapper>
    );
}

export default BaseSidebarScreen;
