import React, {useMemo} from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx/lib/types';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import * as BankAccounts from '@userActions/BankAccounts';
import * as ReimbursementAccount from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

type ConfirmationOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<OnyxTypes.ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<OnyxTypes.ReimbursementAccountDraft>;
};

type ConfirmationProps = ConfirmationOnyxProps & SubStepProps;

const bankInfoStepKeys = CONST.BANK_ACCOUNT.BANK_INFO_STEP.INPUT_KEY;

function Confirmation({reimbursementAccount, reimbursementAccountDraft, onNext}: ConfirmationProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();

    const isLoading = reimbursementAccount?.isLoading ?? false;
    const setupType = reimbursementAccount?.achData?.subStep ?? '';
    const bankAccountID = Number(reimbursementAccount?.achData?.bankAccountID ?? '0');
    const values = useMemo(() => getSubstepValues(bankInfoStepKeys, reimbursementAccountDraft ?? {}, reimbursementAccount ?? {}), [reimbursementAccount, reimbursementAccountDraft]);
    const error = ErrorUtils.getLatestErrorMessage(reimbursementAccount ?? {});

    const handleConnectDifferentAccount = () => {
        if (bankAccountID) {
            ReimbursementAccount.requestResetFreePlanBankAccount();
            return;
        }
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
        >
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <Text style={[styles.textHeadline, styles.ph5, styles.mb6]}>{translate('bankAccount.letsDoubleCheck')}</Text>
                <View style={[styles.cardSection]}>
                    {setupType === CONST.BANK_ACCOUNT.SUBSTEP.MANUAL && (
                        <View style={[styles.mb5, styles.flexRow, styles.alignItemsCenter]}>
                            <Icon
                                src={Expensicons.Bank}
                                additionalStyles={[styles.confirmBankInfoCompanyIcon, styles.mr3]}
                                fill={theme.iconHovered}
                            />
                            <View>
                                <View style={[styles.mb3]}>
                                    <Text style={[styles.mutedTextLabel, styles.mb1]}>{translate('bankAccount.routingNumber')}</Text>
                                    <Text style={styles.confirmBankInfoNumber}>{values[bankInfoStepKeys.ROUTING_NUMBER]}</Text>
                                </View>
                                <View>
                                    <Text style={[styles.mutedTextLabel, styles.mb1]}>{translate('bankAccount.accountNumber')}</Text>
                                    <Text style={styles.confirmBankInfoNumber}>{values[bankInfoStepKeys.ACCOUNT_NUMBER]}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                    {setupType === CONST.BANK_ACCOUNT.SUBSTEP.PLAID && (
                        <MenuItem
                            interactive={false}
                            icon={Expensicons.Bank}
                            iconType={CONST.ICON_TYPE_ICON}
                            iconStyles={[styles.confirmBankInfoCompanyIcon]}
                            iconFill={theme.iconHovered}
                            wrapperStyle={[styles.pl0, styles.mb6]}
                            title={values[bankInfoStepKeys.BANK_NAME]}
                            description={`${translate('bankAccount.accountEnding')} ${(values[bankInfoStepKeys.ACCOUNT_NUMBER] ?? '').slice(-4)}`}
                        />
                    )}
                    <Text style={[styles.confirmBankInfoText, styles.mb4]}>{translate('bankAccount.thisBankAccount')}</Text>
                    <MenuItem
                        icon={Expensicons.Bank}
                        iconType={CONST.ICON_TYPE_ICON}
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
                            messages={{error}}
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

export default withOnyx<ConfirmationProps, ConfirmationOnyxProps>({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(Confirmation);
