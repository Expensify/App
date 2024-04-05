import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Text} from 'react-native';
import ScreenWrapper from '@components/ScreenWrapper';

function TestPage() {
    return (
        <ScreenWrapper testID="testPage">
            <Text style={{color: 'white', fontSize: 30}}>TEST PAGE</Text>
        </ScreenWrapper>
    );
}

TestPage.displayName = 'TestPage';

export default TestPage;
