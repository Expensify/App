import React, {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import ExampleCheckImage from '@pages/ReimbursementAccount/ExampleCheck';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccount} from '@src/types/onyx';

type ManualOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type ManualProps = ManualOnyxProps & SubStepProps;

const BANK_INFO_STEP_KEYS = INPUT_IDS.BANK_INFO_STEP;
const STEP_FIELDS = [BANK_INFO_STEP_KEYS.ROUTING_NUMBER, BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER];

function Manual({reimbursementAccount, onNext}: ManualProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();

    const defaultValues = {
        [BANK_INFO_STEP_KEYS.ROUTING_NUMBER]: reimbursementAccount?.achData?.[BANK_INFO_STEP_KEYS.ROUTING_NUMBER] ?? '',
        [BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER]: reimbursementAccount?.achData?.[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER] ?? '',
    };

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);
        const routingNumber = values.routingNumber?.trim();

        if (
            values.accountNumber &&
            !CONST.BANK_ACCOUNT.REGEX.US_ACCOUNT_NUMBER.test(values.accountNumber.trim()) &&
            !CONST.BANK_ACCOUNT.REGEX.MASKED_US_ACCOUNT_NUMBER.test(values.accountNumber.trim())
        ) {
            errors.accountNumber = 'bankAccount.error.accountNumber';
        } else if (values.accountNumber && values.accountNumber === routingNumber) {
            errors.accountNumber = 'bankAccount.error.routingAndAccountNumberCannotBeSame';
        }
        if (routingNumber && (!CONST.BANK_ACCOUNT.REGEX.SWIFT_BIC.test(routingNumber) || !ValidationUtils.isValidRoutingNumber(routingNumber))) {
            errors.routingNumber = 'bankAccount.error.routingNumber';
        }

        return errors;
    }, []);

    const shouldDisableInputs = !!(reimbursementAccount?.achData?.bankAccountID ?? '');

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            onSubmit={onNext}
            validate={validate}
            submitButtonText={translate('common.next')}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('bankAccount.manuallyAdd')}</Text>
            <Text style={[styles.mb5, styles.textSupporting]}>{translate('bankAccount.checkHelpLine')}</Text>
            <ExampleCheckImage />
            <InputWrapper
                InputComponent={TextInput}
                ref={inputCallbackRef}
                inputID={BANK_INFO_STEP_KEYS.ROUTING_NUMBER}
                label={translate('bankAccount.routingNumber')}
                aria-label={translate('bankAccount.routingNumber')}
                role={CONST.ROLE.PRESENTATION}
                defaultValue={defaultValues[BANK_INFO_STEP_KEYS.ROUTING_NUMBER]}
                inputMode={CONST.INPUT_MODE.NUMERIC}
                disabled={shouldDisableInputs}
                shouldSaveDraft
                shouldUseDefaultValue={shouldDisableInputs}
            />
            <InputWrapper
                InputComponent={TextInput}
                inputID={BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER}
                containerStyles={[styles.mt6]}
                label={translate('bankAccount.accountNumber')}
                aria-label={translate('bankAccount.accountNumber')}
                role={CONST.ROLE.PRESENTATION}
                defaultValue={defaultValues[BANK_INFO_STEP_KEYS.ACCOUNT_NUMBER]}
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
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(Manual);
