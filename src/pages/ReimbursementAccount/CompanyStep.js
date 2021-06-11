import React from 'react';
import {View} from 'react-native';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import {goToWithdrawalStepID} from '../../libs/actions/BankAccounts';
import Navigation from '../../libs/Navigation/Navigation';

const CompanyStep = () => (
    <View>
        <HeaderWithCloseButton
            title="Company Information"
            shouldShowBackButton
            onBackButtonPress={() => goToWithdrawalStepID('BankAccountStep')}
            onCloseButtonPress={Navigation.dismissModal}
        />
    </View>
);

export default CompanyStep;
