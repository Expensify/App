import React from 'react';
import {View} from 'react-native';
import ScreenWrapper from '@components/ScreenWrapper';
import withPolicy from '@pages/workspace/withPolicy';

// Fake page will be removed after normal on will be implemented
function QuickbooksClassesPage() {
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksClassesPage.displayName}
        >
            <View />
        </ScreenWrapper>
    );
}

QuickbooksClassesPage.displayName = 'QuickbooksClassesPage';

export default withPolicy(QuickbooksClassesPage);
