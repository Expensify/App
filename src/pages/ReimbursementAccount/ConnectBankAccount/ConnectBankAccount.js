import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import BankAccount from '@libs/models/BankAccount';
import EnableBankAccount from '@pages/ReimbursementAccount/EnableBankAccount/EnableBankAccount';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as Report from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import BankAccountValidationForm from './components/BankAccountValidationForm';
import FinishChatCard from './components/FinishChatCard';

const propTypes = {
    /** Bank account currently in setup */
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes.isRequired,

    onBackButtonPress: PropTypes.func.isRequired,

    /** User's account who is setting up bank account */
    account: PropTypes.shape({
        /** If user has two-factor authentication enabled */
        requiresTwoFactorAuth: PropTypes.bool,
    }),
};

const defaultProps = {
    account: {
        requiresTwoFactorAuth: false,
    },
};

function ConnectBankAccount({reimbursementAccount, onBackButtonPress, account}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const bankAccountState = lodashGet(reimbursementAccount, 'achData.state');

    // If a user tries to navigate directly to the validate page we'll show them the EnableStep
    if (bankAccountState === BankAccount.STATE.OPEN) {
        return (
            <EnableBankAccount
                reimbursementAccount={reimbursementAccount}
                onBackButtonPress={onBackButtonPress}
            />
        );
    }

    const maxAttemptsReached = lodashGet(reimbursementAccount, 'maxAttemptsReached');
    const isBankAccountVerifying = !maxAttemptsReached && bankAccountState === BankAccount.STATE.VERIFYING;
    const isBankAccountPending = bankAccountState === BankAccount.STATE.PENDING;
    const requiresTwoFactorAuth = lodashGet(account, 'requiresTwoFactorAuth');

    return (
        <ScreenWrapper
            testID={ConnectBankAccount.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldEnablePickerAvoiding={false}
            shouldEnableMaxHeight
            style={[styles.mh2]}
        >
            <HeaderWithBackButton
                title={isBankAccountPending ? translate('connectBankAccountStep.validateYourBankAccount') : translate('connectBankAccountStep.connectBankAccount')}
                onBackButtonPress={onBackButtonPress}
            />
            {maxAttemptsReached && (
                <View style={[styles.m5, styles.flex1]}>
                    <Text>
                        {translate('connectBankAccountStep.maxAttemptsReached')} {translate('common.please')}{' '}
                        <TextLink onPress={Report.navigateToConciergeChat}>{translate('common.contactUs')}</TextLink>.
                    </Text>
                </View>
            )}
            {!maxAttemptsReached && isBankAccountPending && (
                <BankAccountValidationForm
                    requiresTwoFactorAuth={requiresTwoFactorAuth}
                    reimbursementAccount={reimbursementAccount}
                />
            )}
            {isBankAccountVerifying && (
                <FinishChatCard
                    requiresTwoFactorAuth={requiresTwoFactorAuth}
                    reimbursementAccount={reimbursementAccount}
                />
            )}
        </ScreenWrapper>
    );
}

ConnectBankAccount.propTypes = propTypes;
ConnectBankAccount.defaultProps = defaultProps;
ConnectBankAccount.displayName = 'ConnectBankAccount';

export default withOnyx({
    account: {
        key: ONYXKEYS.ACCOUNT,
    },
})(ConnectBankAccount);
