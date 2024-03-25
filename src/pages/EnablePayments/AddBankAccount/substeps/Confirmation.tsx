import React, {useMemo} from 'react';
import {ScrollView, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalBankAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type ConfirmationOnyxProps = {
    /** The draft values of the bank account being setup */
    personalBankAccountDraft: OnyxEntry<PersonalBankAccountForm>;
};

type ConfirmationProps = ConfirmationOnyxProps & SubStepProps;

const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;
const BANK_INFO_STEP_INDEXES = CONST.REIMBURSEMENT_ACCOUNT_SUBSTEP_INDEX.BANK_ACCOUNT;

function Confirmation({reimbursementAccount, personalBankAccountDraft, plaidData, onNext, onMove, userWallet}: ConfirmationProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    console.log({plaidData});

    const values = plaidData?.bankAccounts?.find((account) => account.plaidAccountID === personalBankAccountDraft.plaidAccountID);

    console.log(values);

    const isLoading = plaidData?.isLoading ?? false;
    const setupType = userWallet.subStep ?? '';
    const bankAccountID = Number(reimbursementAccount?.achData?.bankAccountID ?? '0');
    const error = ErrorUtils.getLatestErrorMessage(userWallet ?? {});

    const handleModifyAccountNumbers = () => {
        onMove(BANK_INFO_STEP_INDEXES.ACCOUNT_NUMBERS);
    };

    return (
        <ScrollView
            style={styles.pt0}
            contentContainerStyle={styles.flexGrow1}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5]}>{translate('walletPage.confirmYourBankAccount')}</Text>
            <Text style={[styles.mt3, styles.mb3, styles.ph5, styles.textSupporting]}>{translate('bankAccount.letsDoubleCheck')}</Text>
            {setupType === CONST.BANK_ACCOUNT.SUBSTEP.MANUAL && (
                <View style={[styles.mb5]}>
                    <MenuItemWithTopDescription
                        description={translate('bankAccount.routingNumber')}
                        title={values[BANK_INFO_STEP_KEYS.ROUTING_NUMBER]}
                        shouldShowRightIcon={!bankAccountID}
                        onPress={handleModifyAccountNumbers}
                    />

                    <MenuItemWithTopDescription
                        description={translate('bankAccount.accountNumber')}
                        title={values[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER]}
                        shouldShowRightIcon={!bankAccountID}
                        onPress={handleModifyAccountNumbers}
                    />
                </View>
            )}
            {setupType === CONST.BANK_ACCOUNT.SUBSTEP.PLAID && (
                <MenuItemWithTopDescription
                    description={values[BANK_INFO_STEP_KEYS.BANK_NAME]}
                    title={`${translate('bankAccount.accountEnding')} ${(values[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER] ?? '').slice(-4)}`}
                    shouldShowRightIcon={!bankAccountID}
                    onPress={handleModifyAccountNumbers}
                />
            )}
            <View style={[styles.ph5, styles.pb5, styles.flexGrow1, styles.justifyContentEnd]}>
                {error && error.length > 0 && (
                    <DotIndicatorMessage
                        textStyles={[styles.formError]}
                        type="error"
                        messages={{error}}
                    />
                )}
                <Button
                    isLoading={isLoading}
                    isDisabled={isLoading || isOffline}
                    success
                    large
                    style={[styles.w100]}
                    onPress={onNext}
                    text={translate('common.confirm')}
                />
            </View>
        </ScrollView>
    );
}

Confirmation.displayName = 'Confirmation';

export default withOnyx<ConfirmationProps, ConfirmationOnyxProps>({
    plaidData: {
        key: ONYXKEYS.PLAID_DATA,
    },
    personalBankAccountDraft: {
        key: ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_DRAFT,
    },
    userWallet: {
        key: ONYXKEYS.USER_WALLET,
    },
})(Confirmation);
