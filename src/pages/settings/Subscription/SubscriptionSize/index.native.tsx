import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';

import React from 'react';

function SubscriptionSizePage() {
    return (
        <ScreenWrapper
            testID="SubscriptionSizePage"
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <FullPageNotFoundView shouldShow />
        </ScreenWrapper>
    );
}

export default SubscriptionSizePage;
