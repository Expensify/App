import lodashGet from 'lodash/get';
import React, {useMemo} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import * as ErrorUtils from '@libs/ErrorUtils';
import reimbursementAccountDraftPropTypes from '@pages/ReimbursementAccount/ReimbursementAccountDraftPropTypes';
import {reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import subStepPropTypes from '@pages/ReimbursementAccount/subStepPropTypes';
import getDefaultValueForReimbursementAccountField from '@pages/ReimbursementAccount/utils/getDefaultValueForReimbursementAccountField';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import styles from '@styles/styles';
import themeColors from '@styles/themes/default';
import * as BankAccounts from '@userActions/BankAccounts';
import * as ReimbursementAccount from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,

    ...subStepPropTypes,
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
    reimbursementAccountDraft: {},
};

const bankInfoStepKeys = CONST.BANK_ACCOUNT.BANK_INFO_STEP.INPUT_KEY;

function Confirmation({reimbursementAccount, reimbursementAccountDraft, onNext}) {
    const {translate} = useLocalize();

    const isLoading = lodashGet(reimbursementAccount, 'isLoading', false);
    const setupType = getDefaultValueForReimbursementAccountField(reimbursementAccount, 'subStep');
    const values = useMemo(() => getSubstepValues(bankInfoStepKeys, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);
    const error = ErrorUtils.getLatestErrorMessage(reimbursementAccount);

    const handleConnectDifferentAccount = () => {
        const bankAccountData = {
            [bankInfoStepKeys.ROUTING_NUMBER]: '',
            [bankInfoStepKeys.ACCOUNT_NUMBER]: '',
            [bankInfoStepKeys.PLAID_MASK]: '',
            [bankInfoStepKeys.IS_SAVINGS]: '',
            [bankInfoStepKeys.BANK_NAME]: '',
            [bankInfoStepKeys.PLAID_ACCOUNT_ID]: '',
            [bankInfoStepKeys.PLAID_ACCESS_TOKEN]: '',
        };
        ReimbursementAccount.updateReimbursementAccountDraft(bankAccountData);
        BankAccounts.setBankAccountSubStep(null);
    };

    return (
        <ScreenWrapper
            testID={Confirmation.displayName}
            style={[styles.pt0]}
            scrollEnabled
        >
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <Text style={[styles.textHeadline, styles.ph5, styles.mb6]}>{translate('bankAccount.letsDoubleCheck')}</Text>
                <View style={[styles.confirmBankInfoCard]}>
                    {setupType === CONST.BANK_ACCOUNT.SUBSTEP.MANUAL && (
                        <View style={[styles.mb5]}>
                            <Icon
                                src={Expensicons.Bank}
                                additionalStyles={[styles.confirmBankInfoCompanyIcon, styles.mb5]}
                                fill={themeColors.iconHovered}
                            />
                            <View style={[styles.mb3]}>
                                <Text style={[styles.mutedTextLabel, styles.mb1]}>{translate('bankAccount.routingNumber')}</Text>
                                <Text style={styles.confirmBankInfoNumber}>{values[bankInfoStepKeys.ROUTING_NUMBER]}</Text>
                            </View>
                            <View>
                                <Text style={[styles.mutedTextLabel, styles.mb1]}>{translate('bankAccount.accountNumber')}</Text>
                                <Text style={styles.confirmBankInfoNumber}>{values[bankInfoStepKeys.ACCOUNT_NUMBER]}</Text>
                            </View>
                        </View>
                    )}
                    {setupType === CONST.BANK_ACCOUNT.SUBSTEP.PLAID && (
                        <MenuItem
                            interactive={false}
                            icon={Expensicons.Bank}
                            iconStyles={[styles.confirmBankInfoCompanyIcon]}
                            iconFill={themeColors.iconHovered}
                            wrapperStyle={[styles.pl0, styles.mb6]}
                            title={values[bankInfoStepKeys.BANK_NAME]}
                            description={`${translate('bankAccount.accountEnding')} ${values[bankInfoStepKeys.ACCOUNT_NUMBER].slice(-4)}`}
                        />
                    )}
                    <Text style={[styles.confirmBankInfoText, styles.mb4]}>{translate('bankAccount.thisBankAccount')}</Text>
                    <MenuItem
                        icon={Expensicons.Bank}
                        titleStyle={[styles.confirmBankInfoText]}
                        title={translate('bankAccount.connectDifferentAccount')}
                        onPress={handleConnectDifferentAccount}
                        shouldShowRightIcon
                        wrapperStyle={[styles.cardMenuItem, styles.pl0]}
                    />
                </View>
                <View style={[styles.ph5, styles.mtAuto]}>
                    {error.length > 0 && (
                        <DotIndicatorMessage
                            textStyles={[styles.formError]}
                            type="error"
                            messages={{0: error}}
                        />
                    )}
                    <Button
                        isLoading={isLoading}
                        isDisabled={isLoading}
                        success
                        style={[styles.w100, styles.pb5, styles.mt2]}
                        onPress={onNext}
                        text={translate('common.confirm')}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

Confirmation.displayName = 'Confirmation';
Confirmation.defaultProps = defaultProps;
Confirmation.propTypes = propTypes;

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(Confirmation);
