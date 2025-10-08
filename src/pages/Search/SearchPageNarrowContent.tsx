import {useRoute} from '@react-navigation/native';
import React, {useContext} from 'react';
import {View} from 'react-native';
import Animated, {clamp, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import TopBar from '@components/Navigation/TopBar';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import Search from '@components/Search';
import SearchPageFooter from '@components/Search/SearchPageFooter';
import SearchFiltersBar from '@components/Search/SearchPageHeader/SearchFiltersBar';
import SearchPageHeader from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {SearchHeaderOptionValue} from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {BankAccountMenuItem, SearchParams, SearchQueryJSON} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useScrollEventEmitter from '@hooks/useScrollEventEmitter';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import variables from '@styles/variables';
import type {SearchResults} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

const TOO_CLOSE_TO_TOP_DISTANCE = 10;
const TOO_CLOSE_TO_BOTTOM_DISTANCE = 10;
const ANIMATION_DURATION_IN_MS = 300;

type FooterData = {
    count: number | undefined;
    total: number | undefined;
    currency: string | undefined;
};

type SearchPageNarrowContentProps = {
    queryJSON: SearchQueryJSON;
    headerButtonsOptions: Array<DropdownOption<SearchHeaderOptionValue>>;
    searchResults?: SearchResults;
    isMobileSelectionModeEnabled: boolean;
    footerData: FooterData;
    searchRouterListVisible: boolean;
    setSearchRouterListVisible: (value: boolean) => void;
    handleSearchAction: (value: SearchParams | string) => void;
    clearSelectedTransactions: () => void;
    shouldShowFooter: boolean;
    shouldShowLoadingState: boolean;
    shouldDisplayCancelSearch: boolean;
    cancelSearchCallback?: () => void;
    currentSelectedPolicyID?: string | undefined;
    currentSelectedReportID?: string | undefined;
    confirmPayment?: (paymentType: PaymentMethodType | undefined) => void;
    latestBankItems?: BankAccountMenuItem[] | undefined;
};

function SearchPageNarrowContent({
    queryJSON,
    headerButtonsOptions,
    searchResults,
    isMobileSelectionModeEnabled,
    footerData,
    searchRouterListVisible,
    setSearchRouterListVisible,
    handleSearchAction,
    clearSelectedTransactions,
    shouldShowFooter,
    shouldShowLoadingState,
    shouldDisplayCancelSearch,
    cancelSearchCallback,
    currentSelectedPolicyID,
    currentSelectedReportID,
    confirmPayment,
    latestBankItems,
}: SearchPageNarrowContentProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const triggerScrollEvent = useScrollEventEmitter();
    const {windowHeight} = useWindowDimensions();
    const {saveScrollOffset} = useContext(ScrollOffsetContext);
    // to remove
    const route = useRoute();

    const scrollOffset = useSharedValue(0);
    const topBarOffset = useSharedValue<number>(StyleUtils.searchHeaderDefaultOffset);

    const topBarAnimatedStyle = useAnimatedStyle(() => ({
        top: topBarOffset.get(),
    }));

    const scrollHandler = useAnimatedScrollHandler(
        {
            onScroll: (event) => {
                runOnJS(triggerScrollEvent)();
                const {contentOffset, layoutMeasurement, contentSize} = event;
                if (windowHeight > contentSize.height) {
                    topBarOffset.set(StyleUtils.searchHeaderDefaultOffset);
                    return;
                }
                const currentOffset = contentOffset.y;
                const isScrollingDown = currentOffset > scrollOffset.get();
                const distanceScrolled = currentOffset - scrollOffset.get();

                runOnJS(saveScrollOffset)(route, currentOffset);

                if (isScrollingDown && contentOffset.y > TOO_CLOSE_TO_TOP_DISTANCE) {
                    topBarOffset.set(clamp(topBarOffset.get() - distanceScrolled, variables.minimalTopBarOffset, StyleUtils.searchHeaderDefaultOffset));
                } else if (!isScrollingDown && distanceScrolled < 0 && contentOffset.y + layoutMeasurement.height < contentSize.height - TOO_CLOSE_TO_BOTTOM_DISTANCE) {
                    topBarOffset.set(withTiming(StyleUtils.searchHeaderDefaultOffset, {duration: ANIMATION_DURATION_IN_MS}));
                }
                scrollOffset.set(currentOffset);
            },
        },
        [],
    );

    return (
        <View style={[styles.flex1, styles.overflowHidden]}>
            {!isMobileSelectionModeEnabled ? (
                <View style={[StyleUtils.getSearchPageNarrowHeaderStyles(), searchRouterListVisible && styles.flex1, styles.mh100]}>
                    <View style={[styles.zIndex10, styles.appBG]}>
                        <TopBar
                            shouldShowLoadingBar={shouldShowLoadingState}
                            breadcrumbLabel={translate('common.reports')}
                            shouldDisplaySearch={false}
                            cancelSearch={shouldDisplayCancelSearch ? cancelSearchCallback : undefined}
                        />
                    </View>
                    <View style={[styles.flex1]}>
                        <Animated.View style={[topBarAnimatedStyle, !searchRouterListVisible && styles.narrowSearchRouterInactiveStyle, styles.flex1, styles.bgTransparent]}>
                            <View style={[styles.flex1, styles.pt2, styles.appBG]}>
                                <SearchPageHeader
                                    queryJSON={queryJSON}
                                    searchRouterListVisible={searchRouterListVisible}
                                    hideSearchRouterList={() => {
                                        setSearchRouterListVisible(false);
                                    }}
                                    onSearchRouterFocus={() => {
                                        topBarOffset.set(StyleUtils.searchHeaderDefaultOffset);
                                        setSearchRouterListVisible(true);
                                    }}
                                    headerButtonsOptions={headerButtonsOptions}
                                    handleSearch={handleSearchAction}
                                    isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                                />
                            </View>
                            <View style={[styles.appBG]}>
                                {!searchRouterListVisible && (
                                    <SearchFiltersBar
                                        queryJSON={queryJSON}
                                        headerButtonsOptions={headerButtonsOptions}
                                        isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                                    />
                                )}
                            </View>
                        </Animated.View>
                    </View>
                </View>
            ) : (
                <>
                    <HeaderWithBackButton
                        title={translate('common.selectMultiple')}
                        onBackButtonPress={() => {
                            topBarOffset.set(StyleUtils.searchHeaderDefaultOffset);
                            clearSelectedTransactions();
                            turnOffMobileSelectionMode();
                        }}
                    />
                    <SearchPageHeader
                        queryJSON={queryJSON}
                        headerButtonsOptions={headerButtonsOptions}
                        handleSearch={handleSearchAction}
                        isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                        currentSelectedPolicyID={currentSelectedPolicyID}
                        currentSelectedReportID={currentSelectedReportID}
                        latestBankItems={latestBankItems}
                        confirmPayment={confirmPayment}
                    />
                </>
            )}
            {!searchRouterListVisible && (
                <View style={[styles.flex1]}>
                    <Search
                        searchResults={searchResults}
                        key={queryJSON.hash}
                        queryJSON={queryJSON}
                        onSearchListScroll={scrollHandler}
                        contentContainerStyle={!isMobileSelectionModeEnabled ? styles.searchListContentContainerStyles : undefined}
                        handleSearch={handleSearchAction}
                        isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                    />
                </View>
            )}
            {shouldShowFooter && (
                <SearchPageFooter
                    count={footerData.count}
                    total={footerData.total}
                    currency={footerData.currency}
                />
            )}
        </View>
    );
}

export default SearchPageNarrowContent;
