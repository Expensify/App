import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';

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
