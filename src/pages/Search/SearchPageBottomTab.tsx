import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import useActiveRoute from '@hooks/useActiveRoute';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import TopBar from '@navigation/AppNavigator/createCustomBottomTabNavigator/TopBar';
import SearchFilters from './SearchFilters';

function SearchPageBottomTab() {
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const activeRoute = useActiveRoute();
    const styles = useThemeStyles();

    const currentQuery = activeRoute?.params && 'query' in activeRoute.params ? activeRoute?.params?.query : '';
    const query = String(currentQuery);

    return (
        <ScreenWrapper
            testID={SearchPageBottomTab.displayName}
            style={styles.pt0}
        >
            <TopBar
                breadcrumbLabel={translate('common.search')}
                shouldDisplaySearch={false}
            />
            <SearchFilters query={query} />
            {isSmallScreenWidth && <Search query={query} />}
        </ScreenWrapper>
    );
}

SearchPageBottomTab.displayName = 'SearchPageBottomTab';

export default SearchPageBottomTab;
