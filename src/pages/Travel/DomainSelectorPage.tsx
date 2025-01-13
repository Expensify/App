import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Navigation from '@libs/Navigation/Navigation';
import React, {useCallback, useEffect, useState} from 'react';

function DomainSelectorPage() {

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={DomainSelectorPage.displayName}
        >
            <HeaderWithBackButton
                title='Domain'
                onBackButtonPress={() => Navigation.goBack()}
            />
        </ScreenWrapper>
    );
}

DomainSelectorPage.displayName = 'TravelDomain';

export default DomainSelectorPage;
