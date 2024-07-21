import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';

function AddPaymentCard() {
    return (
        <ScreenWrapper
            testID={AddPaymentCard.displayName}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <FullPageNotFoundView shouldShow />
        </ScreenWrapper>
    );
}

AddPaymentCard.displayName = 'AddPaymentCard';

export default AddPaymentCard;
