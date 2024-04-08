import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import type {CentralPaneNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import SearchResults from './SearchResults';

type SearchPageProps = StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.SEARCH>;

function SearchPage({route}: SearchPageProps) {
    return (
        <ScreenWrapper testID="testPage">
            <SearchResults filter={route.params.filter} />
        </ScreenWrapper>
    );
}

SearchPage.displayName = 'SearchPage';

export default SearchPage;
