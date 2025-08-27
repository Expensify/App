import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import {useSearchContext} from '@components/Search/SearchContext';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {search} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {SearchResults} from '@src/types/onyx';
import type {SearchFilterKey} from '@components/Search/types';

type SearchGroupedTransactionsPageProps = PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.GROUPED_TRANSACTIONS>;


function SearchGroupedTransactionsPage({route}: SearchGroupedTransactionsPageProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {newQuery} = route.params;
    const {clearSelectedTransactions} = useSearchContext();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const isMobileSelectionModeEnabled = useMobileSelectionMode();
    
    const queryJSON = useMemo(() => buildSearchQueryJSON(newQuery), [newQuery]);
    
    // eslint-disable-next-line rulesdir/no-default-id-values
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID}`, {canBeMissing: true});
    
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
                    <DragAndDropProvider>
                        {!!queryJSON && (
                            <Search
                                queryJSON={queryJSON}
                                searchResults={currentSearchResults}
                                handleSearch={handleSearch}
                                isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                            />
                        )}
                    </DragAndDropProvider>
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
                    <DragAndDropProvider>
                        <View style={[styles.flex1, styles.justifyContentEnd, styles.overflowHidden]}>
                            {queryJSON && (
                                <Search
                                    queryJSON={queryJSON}
                                    searchResults={currentSearchResults}
                                    handleSearch={handleSearch}
                                    isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                                />
                            )}
                        </View>
                    </DragAndDropProvider>
                </FullPageNotFoundView>
            </View>
        </ScreenWrapper>
    );
}

SearchGroupedTransactionsPage.displayName = 'SearchGroupedTransactionsPage';

export default SearchGroupedTransactionsPage;