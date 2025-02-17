import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';

function SubscriptionSizePage() {
    return (
        <ScreenWrapper
            testID={SubscriptionSizePage.displayName}
            shouldEnableMaxHeight
        >
            <FullPageNotFoundView shouldShow />
        </ScreenWrapper>
    );
}

SubscriptionSizePage.displayName = 'SubscriptionSizePage';

export default SubscriptionSizePage;
