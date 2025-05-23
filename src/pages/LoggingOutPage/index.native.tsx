import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';

function LoggingOutPage() {
    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            testID={LoggingOutPage.displayName}
        >
            {null}
        </ScreenWrapper>
    );
}

LoggingOutPage.displayName = 'LoggingOutPage';

export default LoggingOutPage;