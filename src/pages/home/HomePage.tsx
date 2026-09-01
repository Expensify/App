import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import QuickCreationActionsBar from '@components/Navigation/QuickCreationActionsBar';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import TopBar from '@components/Navigation/TopBar';
import ReceiptScanDropZone from '@components/ReceiptScanDropZone';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useDocumentTitle from '@hooks/useDocumentTitle';
import {useAppLoadSkeletonState, useShouldWaitForAppLoad} from '@hooks/useInFlightRequests';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';

import {useRef, useState} from 'react';
import {View} from 'react-native';

import DiscoverSection from './DiscoverSection';
import ForYouSection from './ForYouSection';
import FreeTrialSection from './FreeTrialSection';
import GettingStartedSection from './GettingStartedSection';
import {HomePageSkeletonRowCards, HomePageSkeletonSpinnerCard} from './HomePageSkeleton';
import InsightsSection from './InsightsSection';
import RecentlyAddedSection from './RecentlyAddedSection';
import UpcomingTravelSection from './UpcomingTravelSection';
import YourSpendSection from './YourSpendSection';

const LEFT_COLUMN_TEST_ID = 'homePageLeftColumn';
const RIGHT_COLUMN_TEST_ID = 'homePageRightColumn';

function HomePage() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    useDocumentTitle(translate('common.home'));
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [isLoadingReportData = false] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    const isForYouLoading = !!(isLoadingApp || isLoadingReportData);
    const {shouldShowSkeleton} = useAppLoadSkeletonState();
    const shouldWaitForAppLoad = useShouldWaitForAppLoad();
    const shouldShowHomeSkeleton = shouldShowSkeleton && shouldWaitForAppLoad;
    const receiptDropTargetRef = useRef<View>(null);

    // Owned here (above the narrow/wide layout branch) so the Concierge "+" menu survives the ForYouSection remount that
    // happens on breakpoint change, converting between anchored popover and bottom-docked modal instead of vanishing.
    const [isConciergeMenuVisible, setIsConciergeMenuVisible] = useState(false);

    // Held at the same array index in both states, and keyed so the match never depends on that index holding:
    // a match that costs it a move relocates the host node, which blurs a focused Concierge input.
    const forYouSection = (
        <ForYouSection
            key="forYouSection"
            isConciergeMenuVisible={isConciergeMenuVisible}
            setIsConciergeMenuVisible={setIsConciergeMenuVisible}
        />
    );

    // Sections handle their own visibility and may render nothing. The skeleton fills these same slots rather
    // than replacing the whole layout, which would unmount the Concierge card and interrupt anyone typing in it.
    const homeLayout = shouldUseNarrowLayout ? (
        <>
            {/* Occupies a slot whether or not it renders, so the card below keeps its index across the swap. */}
            {shouldShowHomeSkeleton ? null : <FreeTrialSection />}
            {forYouSection}
            {shouldShowHomeSkeleton ? (
                <>
                    <HomePageSkeletonSpinnerCard />
                    <HomePageSkeletonRowCards />
                </>
            ) : (
                <>
                    <GettingStartedSection />
                    <UpcomingTravelSection />
                    <YourSpendSection />
                    <RecentlyAddedSection />
                    <InsightsSection />
                    <DiscoverSection />
                </>
            )}
        </>
    ) : (
        <>
            <View
                testID={LEFT_COLUMN_TEST_ID}
                style={styles.homePageLeftColumn}
            >
                {forYouSection}
                {shouldShowHomeSkeleton ? (
                    <HomePageSkeletonSpinnerCard />
                ) : (
                    <>
                        <GettingStartedSection />
                        <InsightsSection />
                    </>
                )}
            </View>
            <View
                testID={RIGHT_COLUMN_TEST_ID}
                style={styles.homePageRightColumn}
            >
                {shouldShowHomeSkeleton ? (
                    <HomePageSkeletonRowCards />
                ) : (
                    <>
                        <FreeTrialSection />
                        <YourSpendSection />
                        <RecentlyAddedSection />
                        <UpcomingTravelSection />
                        <DiscoverSection />
                    </>
                )}
            </View>
        </>
    );

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
                        style={styles.homePageScrollView}
                        contentContainerStyle={styles.homePageContentContainer}
                        addBottomSafeAreaPadding
                        keyboardShouldPersistTaps="handled"
                    >
                        {!shouldUseNarrowLayout && (
                            <View style={styles.centeredContentWidthLimiter}>
                                <QuickCreationActionsBar />
                            </View>
                        )}
                        <View style={styles.homePageMainLayout(shouldUseNarrowLayout)}>{homeLayout}</View>
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
export {LEFT_COLUMN_TEST_ID, RIGHT_COLUMN_TEST_ID};
