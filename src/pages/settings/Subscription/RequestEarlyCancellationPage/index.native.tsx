import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';

function RequestEarlyCancellationPage() {
    return (
        <ScreenWrapper
            testID="RequestEarlyCancellationPage"
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <FullPageNotFoundView shouldShow />
        </ScreenWrapper>
    );
}

export default RequestEarlyCancellationPage;
