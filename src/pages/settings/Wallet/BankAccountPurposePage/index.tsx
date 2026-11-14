import CollapsibleHeaderOnKeyboardGroup from '@components/CollapsibleHeaderOnKeyboard/Group';
import CollapsibleHeaderOnKeyboardGroupMember from '@components/CollapsibleHeaderOnKeyboard/GroupMember';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';

import Navigation from '@navigation/Navigation';

import React, {useState} from 'react';

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
            <CollapsibleHeaderOnKeyboardGroup>
                <CollapsibleHeaderOnKeyboardGroupMember>
                    <HeaderWithBackButtonAndTitle
                        title={translate('bankAccount.addBankAccount')}
                        onBackButtonPress={handleBackButtonPress}
                    />
                </CollapsibleHeaderOnKeyboardGroupMember>
                {showCountrySelection ? <CountrySelection /> : <BankAccountPurpose showCountrySelectionStep={showCountrySelectionStep} />}
            </CollapsibleHeaderOnKeyboardGroup>
        </ScreenWrapper>
    );
}

BankAccountPurposePage.displayName = 'BankAccountPurposePage';

export default BankAccountPurposePage;
