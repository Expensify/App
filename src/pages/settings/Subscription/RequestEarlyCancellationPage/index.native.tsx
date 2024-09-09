import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';

function RequestEarlyCancellationPage() {
    return (
        <ScreenWrapper
            testID={RequestEarlyCancellationPage.displayName}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <FullPageNotFoundView shouldShow />
        </ScreenWrapper>
    );
}

RequestEarlyCancellationPage.displayName = 'RequestEarlyCancellationPage';

export default RequestEarlyCancellationPage;
