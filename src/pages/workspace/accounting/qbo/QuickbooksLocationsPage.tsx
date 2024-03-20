import React from 'react';
import {View} from 'react-native';
import ScreenWrapper from '@components/ScreenWrapper';
import withPolicy from '@pages/workspace/withPolicy';

// Fake page will be removed after normal on will be implemented
function QuickbooksLocationsPage() {
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksLocationsPage.displayName}
        >
            <View />
        </ScreenWrapper>
    );
}

QuickbooksLocationsPage.displayName = 'QuickbooksLocationsPage';

export default withPolicy(QuickbooksLocationsPage);
