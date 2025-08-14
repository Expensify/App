import React from 'react';
// import React, {useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@navigation/Navigation';
// import CountrySelection from './substeps/CountrySelection';
import {navigateToBankAccountRoute} from '@userActions/ReimbursementAccount';
import ROUTES from '@src/ROUTES';
import BankAccountPurpose from './substeps/BankAccountPurpose';

function BankAccountPurposePage() {
    const {translate} = useLocalize();
    // const [showCountrySelection, setShowCountrySelection] = useState(false);

    const showCountrySelectionStep = () => {
        // setShowCountrySelection(true);
        navigateToBankAccountRoute(undefined, ROUTES.SETTINGS_BANK_ACCOUNT_PURPOSE);
    };

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicator={false}
            testID={BankAccountPurposePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('bankAccount.addBankAccount')}
                onBackButtonPress={() => Navigation.goBack()}
                shouldDisplayHelpButton={false}
            />
            {/* {showCountrySelection ? <CountrySelection /> : <BankAccountPurpose showCountrySelectionStep={showCountrySelectionStep} />} */}
            <BankAccountPurpose showCountrySelectionStep={showCountrySelectionStep} />
        </ScreenWrapper>
    );
}

BankAccountPurposePage.displayName = 'BankAccountPurposePage';

export default BankAccountPurposePage;
