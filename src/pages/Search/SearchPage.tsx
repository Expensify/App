import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import useLocalize from '@hooks/useLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import type {CentralPaneNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {SearchQuery} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';
import useCustomBackHandler from './useCustomBackHandler';

type SearchPageProps = StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.SEARCH.CENTRAL_PANE>;

function SearchPage({route}: SearchPageProps) {
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

    const {query: rawQuery, policyIDs, sortBy, sortOrder} = route?.params ?? {};

    const query = rawQuery as SearchQuery;
    const isValidQuery = Object.values(CONST.TAB_SEARCH).includes(query);

    const headerContent: {[key in SearchQuery]: {icon: IconAsset; title: string}} = {
        all: {icon: Illustrations.MoneyReceipts, title: translate('common.expenses')},
    };

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH.getRoute(CONST.TAB_SEARCH.ALL));

    // We need to override default back button behavior on Android because we need to pop two screens, from the central pane and from the bottom tab.
    useCustomBackHandler();

    // On small screens this page is not displayed, the configuration is in the file: src/libs/Navigation/AppNavigator/createCustomStackNavigator/index.tsx
    // To avoid calling hooks in the Search component when this page isn't visible, we return null here.
    if (isSmallScreenWidth) {
        return null;
    }

    return (
        <ScreenWrapper testID={Search.displayName}>
            <FullPageNotFoundView
                shouldForceFullScreen
                shouldShow={!isValidQuery}
                onBackButtonPress={handleOnBackButtonPress}
                shouldShowLink={false}
            >
                <HeaderWithBackButton
                    title={headerContent[query]?.title}
                    icon={headerContent[query]?.icon}
                    shouldShowBackButton={false}
                />
                <Search
                    policyIDs={policyIDs}
                    query={query}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchPage.displayName = 'SearchPage';

export default SearchPage;
