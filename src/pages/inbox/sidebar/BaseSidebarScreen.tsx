import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import useTabBarBottomContentStyle from '@components/Navigation/TabBarBottomContent/useTabBarBottomContentStyle';
import TopBarWithLoadingBar from '@components/Navigation/TopBarWithLoadingBar';
import OptionsListSkeletonView from '@components/OptionsListSkeletonView';
import ScreenWrapper from '@components/ScreenWrapper';

import {useAppLoadSkeletonState} from '@hooks/useInFlightRequests';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldScrollMainHeader from '@hooks/useShouldScrollMainHeader';
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
    const tabBarBottomContentStyle = useTabBarBottomContentStyle();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldScrollMainHeader = useShouldScrollMainHeader();
    const shouldShowSkeleton = useAppLoadSkeletonState();

    // Tag an in-flight inbox-tab navigation span when the app-loading skeleton is shown instead of the
    // report list, so durations that include the openApp wait can be queried separately in Sentry.
    useEffect(() => {
        if (!shouldShowSkeleton) {
            return;
        }
        getSpan(CONST.TELEMETRY.SPAN_NAVIGATE_TO_INBOX_TAB)?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_SKELETON_SHOWN, true);
    }, [shouldShowSkeleton]);

    const header = (
        <>
            <TopBarWithLoadingBar
                breadcrumbLabel={translate('common.inbox')}
                shouldDisplaySearch={shouldUseNarrowLayout}
                shouldDisplayHelpButton={shouldUseNarrowLayout}
            />
            {!shouldShowSkeleton && <InboxTabSelector />}
        </>
    );

    // The skeleton replaces the report list entirely, so there is nothing to scroll the header away with.
    const shouldRenderHeaderInList = shouldScrollMainHeader && !shouldShowSkeleton;

    return (
        <ScreenWrapper
            shouldEnableKeyboardAvoidingView={false}
            style={[styles.sidebar, isMobile() ? styles.userSelectNone : {}]}
            testID="BaseSidebarScreen"
            bottomContent={<TabBarBottomContent selectedTab={NAVIGATION_TABS.INBOX} />}
            bottomContentStyle={tabBarBottomContentStyle}
        >
            {({insets}) => (
                <>
                    {!shouldRenderHeaderInList && header}
                    <View style={[styles.flex1]}>
                        {shouldShowSkeleton ? (
                            <OptionsListSkeletonView shouldAnimate />
                        ) : (
                            <SidebarLinksData
                                insets={insets}
                                listHeaderComponent={shouldRenderHeaderInList ? header : undefined}
                            />
                        )}
                    </View>
                </>
            )}
        </ScreenWrapper>
    );
}

export default BaseSidebarScreen;
