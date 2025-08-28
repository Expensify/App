import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import {useSearchContext} from '@components/Search/SearchContext';
import CardListItemHeader from '@components/SelectionList/Search/CardListItemHeader';
import MemberListItemHeader from '@components/SelectionList/Search/MemberListItemHeader';
import WithdrawalIDListItemHeader from '@components/SelectionList/Search/WithdrawalIDListItemHeader';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {search} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import HeaderGap from '@components/HeaderGap';
import HeaderWithBackButton from '@components/HeaderWithBackButton';

type SearchGroupedTransactionsPageProps = PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.GROUPED_TRANSACTIONS>;


function SearchGroupedTransactionsPage({route}: SearchGroupedTransactionsPageProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {newQuery, backTo} = route.params;
    const {clearSelectedTransactions} = useSearchContext();
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    
    const queryJSON = useMemo(() => buildSearchQueryJSON(newQuery), [newQuery]);
    
    // Extract group information from the query to determine what type of header to show
    const groupInfo = useMemo(() => {
        if (!queryJSON?.flatFilters) {
            return null;
        }
        
        // Check for FROM filter (member group)
        const fromFilter = queryJSON.flatFilters.find(filter => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM);
        if (fromFilter && fromFilter.filters.length > 0) {
            return {
                type: CONST.SEARCH.GROUP_BY.FROM,
                value: fromFilter.filters[0].value,
            };
        }
        
        // Check for CARD_ID filter (card group)
        const cardFilter = queryJSON.flatFilters.find(filter => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID);
        if (cardFilter && cardFilter.filters.length > 0) {
            return {
                type: CONST.SEARCH.GROUP_BY.CARD,
                value: cardFilter.filters[0].value,
            };
        }
        
        return null;
    }, [queryJSON]);
    
    // eslint-disable-next-line rulesdir/no-default-id-values
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID}`, {canBeMissing: true});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    
    // Clear selected transactions when component mounts
    useEffect(() => {
        clearSelectedTransactions();
    }, [clearSelectedTransactions]);
    
    // Perform the search when query changes
    useEffect(() => {
        if (!queryJSON) {
            return;
        }
        
        search({
            queryJSON,
            searchKey: undefined,
        });
    }, [queryJSON]);
    
    const handleSearch = useCallback(() => {
        if (!queryJSON) {
            return;
        }
        
        search({
            queryJSON,
            searchKey: undefined,
        });
    }, [queryJSON]);
    
    // Create header component based on group type
    const headerComponent = useMemo(() => {
        if (!groupInfo || !currentSearchResults?.data) {
            return null;
        }

        // Create a mock group item for the header
        if (groupInfo.type === CONST.SEARCH.GROUP_BY.FROM && personalDetails) {
            const accountID = typeof groupInfo.value === 'string' ? parseInt(groupInfo.value, 10) : groupInfo.value;
            const memberDetails = personalDetails[accountID];
            
            if (!memberDetails) {
                return null;
            }

            const mockMemberGroupItem = {
                ...memberDetails,
                groupedBy: CONST.SEARCH.GROUP_BY.FROM as typeof CONST.SEARCH.GROUP_BY.FROM,
                accountID,
                avatar: memberDetails.avatar ?? '',
                displayName: memberDetails.displayName ?? '',
                login: memberDetails.login ?? '',
                transactions: [],
                keyForList: `member-${accountID}`,
                isSelected: false,
                count: 0,
                total: 0,
                currency: 'USD',
            };

            return (
                <HeaderWithBackButton
                    title={mockMemberGroupItem.displayName}
                    onBackButtonPress={() => Navigation.navigate(backTo)}
                    subtitle={mockMemberGroupItem.login}
                    policyAvatar={{
                        source: mockMemberGroupItem.avatar,
                        name: mockMemberGroupItem.displayName,
                        id: mockMemberGroupItem.accountID,
                        type: CONST.ICON_TYPE_AVATAR,
                    }}
                />
            );
        }

        if (groupInfo.type === CONST.SEARCH.GROUP_BY.CARD && cardList) {
            const cardID = typeof groupInfo.value === 'string' ? parseInt(groupInfo.value, 10) : groupInfo.value;
            const cardDetails = cardList[cardID];
            
            if (!cardDetails) {
                return null;
            }

            const mockCardGroupItem = {
                ...cardDetails,
                groupedBy: CONST.SEARCH.GROUP_BY.CARD as typeof CONST.SEARCH.GROUP_BY.CARD,
                cardID,
                avatar: '',
                displayName: cardDetails.lastFourPAN ?? '',
                login: '',
                transactions: [],
                keyForList: `card-${cardID}`,
                isSelected: false,
                count: 0,
                total: 0,
                currency: 'USD',
                accountID: cardDetails.accountID,
                cardName: cardDetails.cardName ?? '',
            };

            return (
                <HeaderWithBackButton
                    title={mockCardGroupItem.displayName}
                    onBackButtonPress={() => Navigation.navigate(backTo)}
                    subtitle={mockCardGroupItem.cardName}
                    policyAvatar={{
                        source: mockCardGroupItem.avatar,
                        name: mockCardGroupItem.displayName,
                        id: mockCardGroupItem.accountID,
                        type: CONST.ICON_TYPE_AVATAR,
                    }}
                />
            );
        }

        return null;
    }, [groupInfo, currentSearchResults?.data, personalDetails, cardList, backTo]);
    
    // Check if we should show not found page
    const shouldShowNotFoundPage = useMemo(() => !queryJSON, [queryJSON]);
    
    if (shouldUseNarrowLayout) {
        return (
            <ScreenWrapper
                testID={SearchGroupedTransactionsPage.displayName}
                shouldEnableMaxHeight
                offlineIndicatorStyle={styles.mtAuto}
                headerGapStyles={styles.searchHeaderGap}
            >
                <FullPageNotFoundView
                    shouldShow={shouldShowNotFoundPage}
                    subtitleKey="notFound.noAccess"
                    subtitleStyle={[styles.textSupporting]}
                    shouldDisplaySearchRouter
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={Navigation.goBack}
                >
                    {!!headerComponent && (
                        <>
                            <HeaderGap />
                            <View style={[styles.mh5, styles.mb2]}>
                                {headerComponent}
                            </View>
                        </>
                    )}
                    {!!queryJSON && (
                        <Search
                            queryJSON={queryJSON}
                            searchResults={currentSearchResults}
                            handleSearch={handleSearch}
                            isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                        />
                    )}
                </FullPageNotFoundView>
            </ScreenWrapper>
        );
    }
    
    return (
        <ScreenWrapper
            testID={SearchGroupedTransactionsPage.displayName}
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            headerGapStyles={[styles.searchHeaderGap, styles.h0]}
        >
            <View style={[styles.searchSplitContainer, styles.flexColumn, styles.flex1]}>
                <FullPageNotFoundView
                    shouldShow={shouldShowNotFoundPage}
                    subtitleKey="notFound.noAccess"
                    subtitleStyle={[styles.textSupporting]}
                    shouldDisplaySearchRouter
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={Navigation.goBack}
                >
                    <View style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}>
                        {!!headerComponent && (
                            <View style={[styles.mh5, styles.mb2, styles.mt2]}>
                                {headerComponent}
                            </View>
                        )}
                        {!!queryJSON && (
                            <Search
                                queryJSON={queryJSON}
                                searchResults={currentSearchResults}
                                handleSearch={handleSearch}
                                isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                            />
                        )}
                    </View>
                </FullPageNotFoundView>
            </View>
        </ScreenWrapper>
    );
}

SearchGroupedTransactionsPage.displayName = 'SearchGroupedTransactionsPage';

export default SearchGroupedTransactionsPage;