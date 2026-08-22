/**
 * Shared step for collecting international bank account details (IBAN + SWIFT/BIC), used by both the USD and the
 * Corpay international personal bank account flows so they present the same copy and layout.
 */
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

const IBAN_INPUT_ID = 'iban';
const SWIFT_CODE_INPUT_ID = 'swiftCode';

type InternationalBankAccountDetailsStepProps<TFormID extends keyof OnyxFormValuesMapping> = Pick<SubPageProps, 'isEditing'> & {
    /** The ID of the form */
    formID: TFormID;

    /** The validation function to call when the form is submitted */
    validate: (values: FormOnyxValues<TFormID>) => FormInputErrors<TFormID>;

    /** A function to call when the form is submitted */
    onSubmit: (values: FormOnyxValues<TFormID>) => void;

    /** Pre-filled IBAN value, if one is already known */
    ibanDefaultValue?: string;

    /** Pre-filled SWIFT/BIC code value, if one is already known */
    swiftCodeDefaultValue?: string;

    /** Whether the IBAN input is non-editable because it was already collected on the bank details page */
    isIBANDisabled?: boolean;

    /** Whether the SWIFT/BIC input is non-editable because it was already collected on the bank details page */
    isSwiftCodeDisabled?: boolean;
};

function InternationalBankAccountDetailsStep<TFormID extends keyof OnyxFormValuesMapping>({
    formID,
    validate,
    onSubmit,
    ibanDefaultValue = '',
    swiftCodeDefaultValue = '',
    isIBANDisabled = false,
    isSwiftCodeDisabled = false,
    isEditing,
}: InternationalBankAccountDetailsStepProps<TFormID>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();

    return (
        <FormProvider
            formID={formID}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={onSubmit}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.mb0]}
        >
            <View>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('bankAccount.internationalBankAccountDetailsTitle')}</Text>
                <Text style={[styles.mb5, styles.textSupporting]}>{translate('bankAccount.internationalBankAccountDetailsSubtitle')}</Text>
                <InputWrapper
                    InputComponent={TextInput}
                    ref={!isIBANDisabled ? inputCallbackRef : undefined}
                    inputID={IBAN_INPUT_ID}
                    label={translate('bankAccount.iban')}
                    aria-label={translate('bankAccount.iban')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={ibanDefaultValue}
                    shouldSaveDraft={!isEditing}
                    disabled={isIBANDisabled}
                    shouldUseDefaultValue={isIBANDisabled}
                />
                <InputWrapper
                    InputComponent={TextInput}
                    ref={isIBANDisabled && !isSwiftCodeDisabled ? inputCallbackRef : undefined}
                    inputID={SWIFT_CODE_INPUT_ID}
                    containerStyles={[styles.mt6]}
                    label={translate('bankAccount.swiftBicCode')}
                    aria-label={translate('bankAccount.swiftBicCode')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={swiftCodeDefaultValue}
                    shouldSaveDraft={!isEditing}
                    disabled={isSwiftCodeDisabled}
                    shouldUseDefaultValue={isSwiftCodeDisabled}
                />
            </View>
        </FormProvider>
    );
}

InternationalBankAccountDetailsStep.displayName = 'InternationalBankAccountDetailsStep';

export default InternationalBankAccountDetailsStep;
export {IBAN_INPUT_ID, SWIFT_CODE_INPUT_ID};
