import ScreenWrapper from '@components/ScreenWrapper';

import React from 'react';

import ServerSelector from './ServerSelector';

function ServerPage() {
    return (
        <ScreenWrapper
            enableEdgeToEdgeBottomSafeAreaPadding
            testID="ServerPage"
        >
            <ServerSelector shouldAddBottomSafeAreaPadding />
        </ScreenWrapper>
    );
}

ServerPage.displayName = 'ServerPage';

export default ServerPage;
