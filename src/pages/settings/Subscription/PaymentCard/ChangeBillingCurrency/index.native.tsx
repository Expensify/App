import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';

function ChangeBillingCurrency() {
    return (
        <ScreenWrapper
            testID={ChangeBillingCurrency.displayName}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <FullPageNotFoundView shouldShow />
        </ScreenWrapper>
    );
}

ChangeBillingCurrency.displayName = 'ChangeBillingCurrency';

export default ChangeBillingCurrency;
