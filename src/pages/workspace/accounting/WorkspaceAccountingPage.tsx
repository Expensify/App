import React from 'react';
import {View} from 'react-native';
import ScreenWrapper from '@components/ScreenWrapper';
import withPolicy from '@pages/workspace/withPolicy';

// Fake page will be removed after normal on will be merged
function WorkspaceAccountingPage() {
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={WorkspaceAccountingPage.displayName}
        >
            <View style={{backgroundColor: 'red', height: '100%', width: '100%'}} />
        </ScreenWrapper>
    );
}

WorkspaceAccountingPage.displayName = 'WorkspaceAccountingPage';

export default withPolicy(WorkspaceAccountingPage);
