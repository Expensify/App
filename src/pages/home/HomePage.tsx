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
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDocumentTitle from '@hooks/useDocumentTitle';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import AnnouncementSection from './AnnouncementSection';
import DiscoverSection from './DiscoverSection';
import ForYouSection from './ForYouSection';
import FreeTrialSection from './FreeTrialSection';
import GettingStartedSection from './GettingStartedSection';
import SpendOverTimeSection from './SpendOverTimeSection';
import TimeSensitiveSection from './TimeSensitiveSection';
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
    const firstName = useCurrentUserPersonalDetails()?.firstName?.trim();
    const breadcrumbLabel = !shouldUseNarrowLayout && firstName ? `Welcome, ${firstName}` : translate('common.home');

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
                    shouldDisableGlobalNavBarHeightOffset
                    bottomContent={<TabBarBottomContent selectedTab={NAVIGATION_TABS.HOME} />}
                    bottomContentStyle={styles.overflowVisible}
                >
                    {shouldUseNarrowLayout && (
                        <TopBar
                            breadcrumbLabel={breadcrumbLabel}
                            shouldShowLoadingBar={isForYouLoading}
                            shouldDisplayHelpButton
                            shouldRemoveHorizontalMargin
                            shouldDisplayAccountAvatar
                        />
                    )}
                    <ScrollView
                        contentContainerStyle={styles.homePageContentContainer}
                        addBottomSafeAreaPadding
                    >
                        {!shouldUseNarrowLayout && (
                            <TopBar
                                breadcrumbLabel={breadcrumbLabel}
                                shouldShowLoadingBar={isForYouLoading}
                                shouldDisplayHelpButton
                                shouldRemoveHorizontalMargin
                                shouldDisplayAccountAvatar
                            />
                        )}
                        {!shouldUseNarrowLayout && (
                            <View style={styles.homePageCenteredContent}>
                                <QuickCreationActionsBar />
                            </View>
                        )}
                        <View style={[styles.homePageCenteredContent, styles.homePageMainLayout(shouldUseNarrowLayout)]}>
                            {/* Widgets handle their own visibility and may return null to avoid duplicating visibility logic here */}
                            {shouldUseNarrowLayout ? (
                                <>
                                    <FreeTrialSection />
                                    <TimeSensitiveSection />
                                    <GettingStartedSection />
                                    <ForYouSection />
                                    <UpcomingTravelSection />
                                    <YourSpendSection />
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
                                        <YourSpendSection />
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
