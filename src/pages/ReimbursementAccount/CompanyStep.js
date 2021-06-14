import React from 'react';
import {View} from 'react-native';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import CONST from '../../CONST';
import {goToWithdrawalStepID} from '../../libs/actions/BankAccounts';
import Navigation from '../../libs/Navigation/Navigation';

const CompanyStep = () => (
    <View>
        <HeaderWithCloseButton
            title="Company Information"
            shouldShowBackButton
            onBackButtonPress={() => goToWithdrawalStepID(CONST.BANK_ACCOUNT.STEP.BANK_ACCOUNT)}
            onCloseButtonPress={Navigation.dismissModal}
        />
    </View>
);

export default CompanyStep;
