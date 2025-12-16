import React, {useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@navigation/Navigation';
import BankAccountPurpose from './substeps/BankAccountPurpose';
import CountrySelection from './substeps/CountrySelection';

function BankAccountPurposePage() {
    const {translate} = useLocalize();
    const [showCountrySelection, setShowCountrySelection] = useState(false);

    const showCountrySelectionStep = () => {
        setShowCountrySelection(true);
    };

    const handleBackButtonPress = () => {
        if (showCountrySelection) {
            setShowCountrySelection(false);
        } else {
            Navigation.goBack();
        }
    };

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicator={false}
            testID={BankAccountPurposePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('bankAccount.addBankAccount')}
                onBackButtonPress={handleBackButtonPress}
                shouldDisplayHelpButton={false}
            />
            {showCountrySelection ? <CountrySelection /> : <BankAccountPurpose showCountrySelectionStep={showCountrySelectionStep} />}
        </ScreenWrapper>
    );
}

BankAccountPurposePage.displayName = 'BankAccountPurposePage';

export default BankAccountPurposePage;
