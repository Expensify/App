import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import BankAccountPurpose from '@pages/settings/Wallet/BankAccountPurposePage/substeps/BankAccountPurpose';
import CountrySelection from '@pages/settings/Wallet/BankAccountPurposePage/substeps/CountrySelection';
import variables from '@styles/variables';

const CustomSubStepProps = {};

function BankAccountPurposePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const isAdmin = true;

    const {
        componentToRender: SubStep,
        isEditing,
        nextScreen,
        prevScreen,
        screenIndex,
        moveTo,
        resetScreenIndex,
    } = useSubStep({
        bodyContent: [BankAccountPurpose, CountrySelection],
        startFrom: isAdmin ? 0 : 1,
        onFinished: () => {},
    });


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
            <SubStep isEditing={isEditing} />
        </ScreenWrapper>
    );
}

BankAccountPurposePage.displayName = 'BankAccountPurposePage';

export default BankAccountPurposePage;
