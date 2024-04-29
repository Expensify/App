import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import type {CentralPaneNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type SearchPageProps = StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.SEARCH.CENTRAL_PANE>;

function SearchPage({route}: SearchPageProps) {
    const currentQuery = route?.params && 'query' in route.params ? route?.params?.query : '';
    const query = String(currentQuery);

    return (
        <ScreenWrapper testID={Search.displayName}>
            <HeaderWithBackButton
                title="All"
                icon={Illustrations.MoneyReceipts}
                shouldShowBackButton={false}
            />
            <Search query={query} />;
        </ScreenWrapper>
    );
}

SearchPage.displayName = 'SearchPage';

export default SearchPage;
