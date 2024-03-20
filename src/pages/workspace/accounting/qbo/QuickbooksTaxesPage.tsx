import React from 'react';
import {View} from 'react-native';
import ScreenWrapper from '@components/ScreenWrapper';
import withPolicy from '@pages/workspace/withPolicy';

// Fake page will be removed after normal on will be implemented
function QuickbooksTaxesPage() {
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksTaxesPage.displayName}
        >
            <View />
        </ScreenWrapper>
    );
}

QuickbooksTaxesPage.displayName = 'QuickbooksTaxesPage';

export default withPolicy(QuickbooksTaxesPage);
