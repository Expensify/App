import React, {useMemo} from 'react';
import {ScrollView, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx/lib/types';
import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import MenuItemWithTopDescription from "@components/MenuItemWithTopDescription";

type ConfirmationOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<OnyxTypes.ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<OnyxTypes.ReimbursementAccountDraft>;
};

type ConfirmationProps = ConfirmationOnyxProps & SubStepProps;

const bankInfoStepKeys = CONST.BANK_ACCOUNT.BANK_INFO_STEP.INPUT_KEY;

function Confirmation({reimbursementAccount, reimbursementAccountDraft, onNext, onMove}: ConfirmationProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const isLoading = reimbursementAccount?.isLoading ?? false;
    const setupType = reimbursementAccount?.achData?.subStep ?? '';
    const bankAccountID = Number(reimbursementAccount?.achData?.bankAccountID ?? '0');
    const values = useMemo(() => getSubstepValues(bankInfoStepKeys, reimbursementAccountDraft ?? {}, reimbursementAccount ?? {}), [reimbursementAccount, reimbursementAccountDraft]);
    const error = ErrorUtils.getLatestErrorMessage(reimbursementAccount ?? {});

    const handleModifyAccountNumbers = () => {
        if (bankAccountID) {
            return;
        }
        onMove(0);
    };

    return (
        <ScreenWrapper
            testID={Confirmation.displayName}
            style={[styles.pt0]}
        >
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <Text style={[styles.textHeadline, styles.ph5, styles.mb6]}>{translate('bankAccount.letsDoubleCheck')}</Text>
                {setupType === CONST.BANK_ACCOUNT.SUBSTEP.MANUAL && (
                    <View style={[styles.mb5]}>
                        <MenuItemWithTopDescription
                            description={translate('bankAccount.routingNumber')}
                            title={values[bankInfoStepKeys.ROUTING_NUMBER]}
                            shouldShowRightIcon={!Boolean(bankAccountID)}
                            onPress={handleModifyAccountNumbers}
                        />

                        <MenuItemWithTopDescription
                            description={translate('bankAccount.accountNumber')}
                            title={values[bankInfoStepKeys.ACCOUNT_NUMBER]}
                            shouldShowRightIcon={!Boolean(bankAccountID)}
                            onPress={handleModifyAccountNumbers}
                        />
                    </View>
                )}
                {setupType === CONST.BANK_ACCOUNT.SUBSTEP.PLAID && (
                    <MenuItemWithTopDescription
                        description={values[bankInfoStepKeys.BANK_NAME]}
                        title={`${translate('bankAccount.accountEnding')} ${(values[bankInfoStepKeys.ACCOUNT_NUMBER] ?? '').slice(-4)}`}
                        shouldShowRightIcon={!Boolean(bankAccountID)}
                        onPress={handleModifyAccountNumbers}
                    />
                )}
                <Text style={[styles.mt3, styles.ph5, styles.textMicroSupporting]}>
                    {translate('bankAccount.thisBankAccount')}
                </Text>
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
