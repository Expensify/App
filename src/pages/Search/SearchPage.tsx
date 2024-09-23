import React, {useMemo} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as SearchUtils from '@libs/SearchUtils';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type SearchPageProps = PlatformStackScreenProps<AuthScreensParamList, typeof SCREENS.SEARCH.CENTRAL_PANE>;

function SearchPage({route}: SearchPageProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {q} = route.params;

    const queryJSON = useMemo(() => SearchUtils.buildSearchQueryJSON(q), [q]);
    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: SearchUtils.buildCannedSearchQuery()}));

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
                {queryJSON && <Search queryJSON={queryJSON} />}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchPage.displayName = 'SearchPage';

export default SearchPage;
