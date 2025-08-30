import React, {useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import Navigation from '@navigation/Navigation';
import {navigateToBankAccountRoute} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import BankAccountPurpose from './substeps/BankAccountPurpose';
import CountrySelection from './substeps/CountrySelection';

function BankAccountPurposePage() {
    const {translate} = useLocalize();
    const [showCountrySelection, setShowCountrySelection] = useState(false);
    const {isBetaEnabled} = usePermissions();

    const showCountrySelectionStep = () => {
        if (isBetaEnabled(CONST.BETAS.GLOBAL_REIMBURSEMENTS_ON_ND)) {
            setShowCountrySelection(true);
            return;
        }

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
            {showCountrySelection ? <CountrySelection /> : <BankAccountPurpose showCountrySelectionStep={showCountrySelectionStep} />}
        </ScreenWrapper>
    );
}

BankAccountPurposePage.displayName = 'BankAccountPurposePage';

export default BankAccountPurposePage;
