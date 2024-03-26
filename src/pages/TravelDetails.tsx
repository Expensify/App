import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import React from 'react';
import * as Expensicons from '@components/Icon/Expensicons';
import variables from '@styles/variables';
import * as Link from '@userActions/Link';

function TravelDetails() {
    const {translate} = useLocalize();

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={TravelDetails.displayName}
        >
            <HeaderWithBackButton
                title={translate('travel.details')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <MenuItem
                title={translate('travel.tripSupport')}
                icon={Expensicons.Phone}
                iconWidth={variables.iconSizeMedium}
                iconHeight={variables.iconSizeMedium}
                interactive
                onPress={() => {
                    // Replace with user-support page.
                    Link.openExternalLink('https://www.spotnana.com/contact/');
                }}
            />
        </ScreenWrapper>
    );
}

TravelDetails.displayName = 'TravelDetails';

export default TravelDetails;