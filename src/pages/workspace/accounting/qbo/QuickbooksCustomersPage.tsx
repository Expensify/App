import React from 'react';
import {View} from 'react-native';
import ScreenWrapper from '@components/ScreenWrapper';
import withPolicy from '@pages/workspace/withPolicy';

// Fake page will be removed after normal on will be implemented
function QuickbooksCustomersPage() {
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksCustomersPage.displayName}
        >
            <View />
        </ScreenWrapper>
    );
}

QuickbooksCustomersPage.displayName = 'QuickbooksCustomersPage';

export default withPolicy(QuickbooksCustomersPage);
