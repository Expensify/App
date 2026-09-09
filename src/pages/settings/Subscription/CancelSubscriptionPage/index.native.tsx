import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';

import React from 'react';

function CancelSubscriptionPage() {
    return (
        <ScreenWrapper
            testID="CancelSubscriptionPage"
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <FullPageNotFoundView shouldShow />
        </ScreenWrapper>
    );
}

export default CancelSubscriptionPage;
