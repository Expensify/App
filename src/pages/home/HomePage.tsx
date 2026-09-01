import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import QuickCreationActionsBar from '@components/Navigation/QuickCreationActionsBar';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import TopBar from '@components/Navigation/TopBar';
import ReceiptScanDropZone from '@components/ReceiptScanDropZone';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useDocumentTitle from '@hooks/useDocumentTitle';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';

import React, {useRef, useState} from 'react';
import {View} from 'react-native';

import DiscoverSection from './DiscoverSection';
import ForYouSection from './ForYouSection';
import FreeTrialSection from './FreeTrialSection';
import GettingStartedSection from './GettingStartedSection';
import InsightsSection from './InsightsSection';
import RecentlyAddedSection from './RecentlyAddedSection';
import UpcomingTravelSection from './UpcomingTravelSection';
import YourSpendSection from './YourSpendSection';

function HomePage() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    useDocumentTitle(translate('common.home'));
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [isLoadingReportData = false] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    const isForYouLoading = !!(isLoadingApp || isLoadingReportData);
    const receiptDropTargetRef = useRef<View>(null);

    // Owned here (above the narrow/wide layout branch) so the Concierge "+" menu survives the ForYouSection remount that
    // happens on breakpoint change, converting between anchored popover and bottom-docked modal instead of vanishing.
    const [isConciergeMenuVisible, setIsConciergeMenuVisible] = useState(false);

    return (
        <View style={styles.flex1}>
            <View
                ref={receiptDropTargetRef}
                style={styles.flex1}
            >
                <ScreenWrapper
                    shouldEnablePickerAvoiding={false}
                    shouldShowOfflineIndicatorInWideScreen
                    testID="HomePage"
                    enableEdgeToEdgeBottomSafeAreaPadding={false}
                    bottomContent={<TabBarBottomContent selectedTab={NAVIGATION_TABS.HOME} />}
                    bottomContentStyle={styles.overflowVisible}
                >
                    <TopBar
                        breadcrumbLabel={translate('common.home')}
                        shouldShowLoadingBar={isForYouLoading}
                        shouldDisplayHelpButton
                    />
                    <ScrollView
                        contentContainerStyle={styles.homePageContentContainer}
                        addBottomSafeAreaPadding
                        keyboardShouldPersistTaps="handled"
                    >
                        {!shouldUseNarrowLayout && (
                            <View style={styles.centeredContentWidthLimiter}>
                                <QuickCreationActionsBar />
                            </View>
                        )}
                        <View style={styles.homePageMainLayout(shouldUseNarrowLayout)}>
                            {/* Widgets handle their own visibility and may return null to avoid duplicating visibility logic here */}
                            {shouldUseNarrowLayout ? (
                                <>
                                    <FreeTrialSection />
                                    <ForYouSection
                                        isConciergeMenuVisible={isConciergeMenuVisible}
                                        setIsConciergeMenuVisible={setIsConciergeMenuVisible}
                                    />
                                    <GettingStartedSection />
                                    <UpcomingTravelSection />
                                    <YourSpendSection />
                                    <RecentlyAddedSection />
                                    <InsightsSection />
                                    <DiscoverSection />
                                </>
                            ) : (
                                <>
                                    <View
                                        testID="homePageLeftColumn"
                                        style={styles.homePageLeftColumn}
                                    >
                                        <ForYouSection
                                            isConciergeMenuVisible={isConciergeMenuVisible}
                                            setIsConciergeMenuVisible={setIsConciergeMenuVisible}
                                        />
                                        <GettingStartedSection />
                                        <InsightsSection />
                                    </View>
                                    <View
                                        testID="homePageRightColumn"
                                        style={styles.homePageRightColumn}
                                    >
                                        <FreeTrialSection />
                                        <YourSpendSection />
                                        <RecentlyAddedSection />
                                        <UpcomingTravelSection />
                                        <DiscoverSection />
                                    </View>
                                </>
                            )}
                        </View>
                    </ScrollView>
                </ScreenWrapper>
            </View>
            <ReceiptScanDropZone
                targetRef={receiptDropTargetRef}
                dropWrapperStyle={shouldUseNarrowLayout ? {marginBottom: variables.bottomTabHeight} : undefined}
            />
        </View>
    );
}

export default HomePage;
