import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import {buildSearchQueryJSON, getQueryStringFromParams} from '@libs/SearchUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type SearchPageProps = StackScreenProps<AuthScreensParamList, typeof SCREENS.SEARCH.CENTRAL_PANE>;

function SearchPage({route}: SearchPageProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();

    const queryJSON = useMemo(() => buildSearchQueryJSON(getQueryStringFromParams(route.params)), [route.params]);

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: CONST.SEARCH.TAB.EXPENSE.ALL}));

    // On small screens this page is not displayed, the configuration is in the file: src/libs/Navigation/AppNavigator/createCustomStackNavigator/index.tsx
    // To avoid calling hooks in the Search component when this page isn't visible, we return null here.
    if (isSmallScreenWidth) {
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
                    <Search
                        queryJSON={queryJSON}
                        policyIDs={route.params.policyIDs}
                    />
                )}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchPage.displayName = 'SearchPage';

export default SearchPage;
