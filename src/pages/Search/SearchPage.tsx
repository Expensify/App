import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo, useRef} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import {useSearchContext} from '@components/Search/SearchContext';
import SearchPageHeader from '@components/Search/SearchPageHeader';
import SearchStatusBar from '@components/Search/SearchStatusBar';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as SearchUtils from '@libs/SearchUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type SearchPageProps = StackScreenProps<AuthScreensParamList, typeof SCREENS.SEARCH.CENTRAL_PANE>;

function SearchPage({route}: SearchPageProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {q} = route.params;
    const navigation = useNavigation<StackNavigationProp<AuthScreensParamList>>();
    const {clearSelectedTransactions} = useSearchContext();
    const {selectionMode} = useMobileSelectionMode();
    const clearSelectedTransactionsRef = useRef(clearSelectedTransactions);
    const selectionModeRef = useRef(selectionMode);
    selectionModeRef.current = selectionMode;
    clearSelectedTransactionsRef.current = clearSelectedTransactions;

    const queryJSON = useMemo(() => SearchUtils.buildSearchQueryJSON(q), [q]);
    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: SearchUtils.buildCannedSearchQuery()}));

    useEffect(() => {
        navigation.addListener('beforeRemove', (e) => {
            if (!selectionModeRef?.current?.isEnabled) {
                navigation.dispatch(e.data.action);
                return;
            }
            e.preventDefault();
            // When the navigation type is not reset that means we're not using the back button browser to navigate
            // So we should still dispatch the action to go to the target page
            if (e.data.action.type !== CONST.NAVIGATION_ACTIONS.RESET) {
                navigation.dispatch(e.data.action);
            }
            clearSelectedTransactionsRef?.current?.(undefined, true);
        });
    }, [navigation]);

    // On small screens this page is not displayed, the configuration is in the file: src/libs/Navigation/AppNavigator/createCustomStackNavigator/index.tsx
    // To avoid calling hooks in the Search component when this page isn't visible, we return null here.
    if (shouldUseNarrowLayout) {
        return null;
    }

    return (
        <ScreenWrapper
            testID={Search.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <FullPageNotFoundView
                shouldForceFullScreen
                shouldShow={!queryJSON}
                onBackButtonPress={handleOnBackButtonPress}
                shouldShowLink={false}
            >
                {queryJSON && (
                    <>
                        <SearchPageHeader
                            queryJSON={queryJSON}
                            hash={queryJSON.hash}
                        />
                        <SearchStatusBar
                            type={queryJSON.type}
                            status={queryJSON.status}
                            policyID={queryJSON.policyID}
                        />
                        <Search queryJSON={queryJSON} />
                    </>
                )}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchPage.displayName = 'SearchPage';

export default SearchPage;
