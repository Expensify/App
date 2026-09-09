import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';

import React from 'react';

function AddPaymentCard() {
    return (
        <ScreenWrapper
            testID="AddPaymentCard"
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <FullPageNotFoundView shouldShow />
        </ScreenWrapper>
    );
}

export default AddPaymentCard;
