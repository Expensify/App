import React, {useRef} from 'react';
import {View} from 'react-native';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import QuickCreationActionsBar from '@components/Navigation/QuickCreationActionsBar';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import TopBar from '@components/Navigation/TopBar';
import ReceiptScanDropZone from '@components/ReceiptScanDropZone';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useConfirmReadyToOpenApp from '@hooks/useConfirmReadyToOpenApp';
import useDocumentTitle from '@hooks/useDocumentTitle';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import AnnouncementSection from './AnnouncementSection';
import AssignedCardsSection from './AssignedCardsSection';
import DiscoverSection from './DiscoverSection';
import ForYouSection from './ForYouSection';
import FreeTrialSection from './FreeTrialSection';
import GettingStartedSection from './GettingStartedSection';
import SpendOverTimeSection from './SpendOverTimeSection';
import TimeSensitiveSection from './TimeSensitiveSection';
import UpcomingTravelSection from './UpcomingTravelSection';

function HomePage() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    useDocumentTitle(translate('common.home'));
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [isLoadingReportData = false] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    const isForYouLoading = !!(isLoadingApp || isLoadingReportData);
    const receiptDropTargetRef = useRef<View>(null);

    // This hook signals that the app is ready to be opened after HomePage mounts
    // to make sure everything loads properly
    useConfirmReadyToOpenApp();

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
                    >
                        {!shouldUseNarrowLayout && <QuickCreationActionsBar />}
                        <View style={styles.homePageMainLayout(shouldUseNarrowLayout)}>
                            {/* Widgets handle their own visibility and may return null to avoid duplicating visibility logic here */}
                            {shouldUseNarrowLayout ? (
                                <>
                                    <FreeTrialSection />
                                    <TimeSensitiveSection />
                                    <GettingStartedSection />
                                    <ForYouSection />
                                    <UpcomingTravelSection />
                                    <AssignedCardsSection />
                                    <SpendOverTimeSection />
                                    <DiscoverSection />
                                    <AnnouncementSection />
                                </>
                            ) : (
                                <>
                                    <View style={styles.homePageLeftColumn}>
                                        <TimeSensitiveSection />
                                        <ForYouSection />
                                        <SpendOverTimeSection />
                                        <DiscoverSection />
                                    </View>
                                    <View style={styles.homePageRightColumn}>
                                        <FreeTrialSection />
                                        <GettingStartedSection />
                                        <UpcomingTravelSection />
                                        <AssignedCardsSection />
                                        <AnnouncementSection />
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
