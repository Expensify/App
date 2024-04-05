import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {Text} from 'react-native';
import ScreenWrapper from '@components/ScreenWrapper';
import type {CentralPaneNavigatorParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';

type SearchPageProps = StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.SEARCH>;

function SearchPage({route}: SearchPageProps) {
    return (
        <ScreenWrapper testID="testPage">
            <Text style={{color: 'white', fontSize: 30}}>Search page |{route.params.filter}|</Text>
        </ScreenWrapper>
    );
}

SearchPage.displayName = 'SearchPage';

export default SearchPage;
