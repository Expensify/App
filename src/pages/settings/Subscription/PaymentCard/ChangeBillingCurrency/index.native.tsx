import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';

import React from 'react';

function ChangeBillingCurrency() {
    return (
        <ScreenWrapper
            testID="ChangeBillingCurrency"
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <FullPageNotFoundView shouldShow />
        </ScreenWrapper>
    );
}

export default ChangeBillingCurrency;
