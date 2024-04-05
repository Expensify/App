import React from 'react';
import {Text} from 'react-native';
import ScreenWrapper from '@components/ScreenWrapper';

function SearchPage() {
    return (
        <ScreenWrapper testID="testPage">
            <Text style={{color: 'white', fontSize: 30}}>Search page BOTTOM TAB </Text>
        </ScreenWrapper>
    );
}

SearchPage.displayName = 'SearchPage';

export default SearchPage;
