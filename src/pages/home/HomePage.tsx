import React from 'react';
import {View} from 'react-native';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useConfirmReadyToOpenApp from '@hooks/useConfirmReadyToOpenApp';
import useDocumentTitle from '@hooks/useDocumentTitle';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReceiptScanDrop from '@hooks/useReceiptScanDrop';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import usePreloadFullScreenNavigators from '@libs/Navigation/AppNavigator/usePreloadFullScreenNavigators';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import AnnouncementSection from './AnnouncementSection';
import AssignedCardsSection from './AssignedCardsSection';
import DiscoverSection from './DiscoverSection';
import ForYouSection from './ForYouSection';
import TimeSensitiveSection from './TimeSensitiveSection';
import UpcomingTravelSection from './UpcomingTravelSection';

function HomePage() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const shouldDisplayLHB = !shouldUseNarrowLayout;
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    useDocumentTitle(translate('common.home'));
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['SmartScan'] as const);
    const {initScanRequest, PDFValidationComponent, ErrorModal, isDragDisabled} = useReceiptScanDrop();
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [isLoadingReportData = false] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    const isForYouLoading = !!(isLoadingApp || isLoadingReportData);

    // This hook signals that the app is ready to be opened after HomePage mounts
    // to make sure everything loads properly
    useConfirmReadyToOpenApp();

    // This hook preloads the screens of adjacent tabs to make changing tabs faster.
    usePreloadFullScreenNavigators();

    return (
        <DragAndDropProvider isDisabled={isDragDisabled}>
            {PDFValidationComponent}
            <ScreenWrapper
                shouldEnablePickerAvoiding={false}
                shouldShowOfflineIndicatorInWideScreen
                testID="HomePage"
                enableEdgeToEdgeBottomSafeAreaPadding={false}
                bottomContent={
                    shouldUseNarrowLayout && (
                        <NavigationTabBar
                            selectedTab={NAVIGATION_TABS.HOME}
                            shouldShowFloatingButtons
                        />
                    )
                }
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
                    <View style={styles.homePageMainLayout(shouldUseNarrowLayout)}>
                        {/* Widgets handle their own visibility and may return null to avoid duplicating visibility logic here */}
                        <View style={styles.homePageLeftColumn(shouldUseNarrowLayout)}>
                            <TimeSensitiveSection />
                            <ForYouSection />
                            <DiscoverSection />
                        </View>
                        <View style={styles.homePageRightColumn(shouldUseNarrowLayout)}>
                            <UpcomingTravelSection />
                            <AssignedCardsSection />
                            <AnnouncementSection />
                        </View>
                    </View>
                </ScrollView>
                {shouldDisplayLHB && <NavigationTabBar selectedTab={NAVIGATION_TABS.HOME} />}
            </ScreenWrapper>
            <DragAndDropConsumer onDrop={initScanRequest}>
                <DropZoneUI
                    icon={expensifyIcons.SmartScan}
                    dropTitle={translate('dropzone.scanReceipts')}
                    dropStyles={styles.receiptDropOverlay(true)}
                    dropTextStyles={styles.receiptDropText}
                    dropWrapperStyles={shouldUseNarrowLayout ? {marginBottom: variables.bottomTabHeight} : undefined}
                    dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.receiptDropBorderColorActive, true)]}
                />
            </DragAndDropConsumer>
            {ErrorModal}
        </DragAndDropProvider>
    );
}

export default HomePage;
