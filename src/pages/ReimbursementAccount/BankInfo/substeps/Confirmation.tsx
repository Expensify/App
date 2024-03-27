import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccount} from '@src/types/onyx';

type ConfirmationOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>;
};

type ConfirmationProps = ConfirmationOnyxProps & SubStepProps;

const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;
const BANK_INFO_STEP_INDEXES = CONST.REIMBURSEMENT_ACCOUNT_SUBSTEP_INDEX.BANK_ACCOUNT;

function Confirmation({reimbursementAccount, reimbursementAccountDraft, onNext, onMove}: ConfirmationProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const isLoading = reimbursementAccount?.isLoading ?? false;
    const setupType = reimbursementAccount?.achData?.subStep ?? '';
    const bankAccountID = Number(reimbursementAccount?.achData?.bankAccountID ?? '0');
    const values = useMemo(() => getSubstepValues(BANK_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount ?? {}), [reimbursementAccount, reimbursementAccountDraft]);
    const error = ErrorUtils.getLatestErrorMessage(reimbursementAccount ?? {});

    const handleModifyAccountNumbers = () => {
        onMove(BANK_INFO_STEP_INDEXES.ACCOUNT_NUMBERS);
    };

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <ScrollView
                    style={styles.pt0}
                    contentContainerStyle={[styles.flexGrow1, safeAreaPaddingBottomStyle]}
                >
                    <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5]}>{translate('bankAccount.letsDoubleCheck')}</Text>
                    <Text style={[styles.mt3, styles.mb3, styles.ph5, styles.textSupporting]}>{translate('bankAccount.thisBankAccount')}</Text>
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
                            style={[styles.w100]}
                            onPress={onNext}
                            large
                            text={translate('common.confirm')}
                        />
                    </View>
                </ScrollView>
            )}
        </SafeAreaConsumer>
    );
}

Confirmation.displayName = 'Confirmation';

export default withOnyx<ConfirmationProps, ConfirmationOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
    },
})(Confirmation);
