import React, {useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx/lib/types';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import ExampleCheckImage from '@pages/ReimbursementAccount/ExampleCheck';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccount} from '@src/types/onyx';

type ManualOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type ManualProps = ManualOnyxProps & SubStepProps;

type FormValues = {routingNumber: string; accountNumber: string};

const bankInfoStepKeys = CONST.BANK_ACCOUNT.BANK_INFO_STEP.INPUT_KEY;

function Manual({reimbursementAccount, onNext}: ManualProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const defaultValues: FormValues = {
        [bankInfoStepKeys.ROUTING_NUMBER]: reimbursementAccount?.achData?.[bankInfoStepKeys.ROUTING_NUMBER] ?? '',
        [bankInfoStepKeys.ACCOUNT_NUMBER]: reimbursementAccount?.achData?.[bankInfoStepKeys.ACCOUNT_NUMBER] ?? '',
    };

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Object}
     */
    const validate = useCallback(
        (values: FormValues) => {
            const requiredFields = [bankInfoStepKeys.ROUTING_NUMBER, bankInfoStepKeys.ACCOUNT_NUMBER];
            const errors = ValidationUtils.getFieldRequiredErrors(values, requiredFields);
            const routingNumber = values.routingNumber?.trim();

            if (
                values.accountNumber &&
                !CONST.BANK_ACCOUNT.REGEX.US_ACCOUNT_NUMBER.test(values.accountNumber.trim()) &&
                !CONST.BANK_ACCOUNT.REGEX.MASKED_US_ACCOUNT_NUMBER.test(values.accountNumber.trim())
            ) {
                errors.accountNumber = 'bankAccount.error.accountNumber';
            } else if (values.accountNumber && values.accountNumber === routingNumber) {
                errors.accountNumber = translate('bankAccount.error.routingAndAccountNumberCannotBeSame');
            }
            if (routingNumber && (!CONST.BANK_ACCOUNT.REGEX.SWIFT_BIC.test(routingNumber) || !ValidationUtils.isValidRoutingNumber(routingNumber))) {
                errors.routingNumber = 'bankAccount.error.routingNumber';
            }

            return errors;
        },
        [translate],
    );

    const shouldDisableInputs = !!(reimbursementAccount?.achData?.bankAccountID ?? '');

    return (
        // @ts-expect-error TODO: Remove this once FormProvider (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript.
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            onSubmit={onNext}
            validate={validate}
            submitButtonText={translate('common.next')}
            style={[styles.mh5, styles.flexGrow1]}
            shouldSaveDraft
        >
            <Text style={[styles.textHeadline, styles.mb3]}>{translate('bankAccount.manuallyAdd')}</Text>
            <Text style={[styles.mb5, styles.textLabel]}>{translate('bankAccount.checkHelpLine')}</Text>
            <ExampleCheckImage />
            <InputWrapper
                // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript.
                InputComponent={TextInput}
                inputID={bankInfoStepKeys.ROUTING_NUMBER}
                label={translate('bankAccount.routingNumber')}
                aria-label={translate('bankAccount.routingNumber')}
                role={CONST.ROLE.PRESENTATION}
                defaultValue={defaultValues[bankInfoStepKeys.ROUTING_NUMBER]}
                inputMode={CONST.INPUT_MODE.NUMERIC}
                disabled={shouldDisableInputs}
                shouldSaveDraft
                shouldUseDefaultValue={shouldDisableInputs}
            />
            <InputWrapper
                // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript.
                InputComponent={TextInput}
                inputID={bankInfoStepKeys.ACCOUNT_NUMBER}
                containerStyles={[styles.mt4]}
                label={translate('bankAccount.accountNumber')}
                aria-label={translate('bankAccount.accountNumber')}
                role={CONST.ROLE.PRESENTATION}
                defaultValue={defaultValues[bankInfoStepKeys.ACCOUNT_NUMBER]}
                inputMode={CONST.INPUT_MODE.NUMERIC}
                disabled={shouldDisableInputs}
                shouldSaveDraft
                shouldUseDefaultValue={shouldDisableInputs}
            />
        </FormProvider>
    );
}

Manual.displayName = 'Manual';

export default withOnyx<ManualProps, ManualOnyxProps>({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(Manual);
