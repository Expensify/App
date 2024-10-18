import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import AddressFormFields from '@pages/ReimbursementAccount/AddressFormFields';
import HelpLinks from '@pages/ReimbursementAccount/PersonalInfo/HelpLinks';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';

type AddressValues = {
    street: string;
    city: string;
    state: string;
    zipCode: string;
};

type AddressStepProps<TFormID extends FormOnyxKeys> = SubStepProps & {
    /** The ID of the form */
    formID: TFormID;

    /** The title of the form */
    formTitle: string;

    /** The disclaimer informing that PO box is not allowed */
    formPOBoxDisclaimer?: string;

    /** The validation function to call when the form is submitted */
    customValidate?: (values: FormOnyxValues<TFormID>) => FormInputErrors<TFormID>;

    /** A function to call when the form is submitted */
    onSubmit: (values: FormOnyxValues<TFormID>) => void;

    /** Fields list of the form */
    stepFields: Array<FormOnyxKeys<keyof OnyxFormValuesMapping>>;

    /* The IDs of the input fields */
    inputFieldsIDs: AddressValues;

    /** The default values for the form */
    defaultValues: AddressValues;

    /** Should show help links */
    shouldShowHelpLinks?: boolean;
};

function AddressStep<TFormID extends FormOnyxKeys>({
    formID,
    formTitle,
    formPOBoxDisclaimer,
    customValidate,
    onSubmit,
    stepFields,
    inputFieldsIDs,
    defaultValues,
    shouldShowHelpLinks,
    isEditing,
}: AddressStepProps<TFormID>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const validate = useCallback(
        (values: FormOnyxValues<TFormID>): FormInputErrors<TFormID> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, stepFields);

            if (values[inputFieldsIDs.street] && !ValidationUtils.isValidAddress(values[inputFieldsIDs.street])) {
                // @ts-expect-error type mismatch to be fixed
                errors[inputFieldsIDs.street] = translate('bankAccount.error.addressStreet');
            }

            if (values[inputFieldsIDs.zipCode] && !ValidationUtils.isValidZipCode(values[inputFieldsIDs.zipCode])) {
                // @ts-expect-error type mismatch to be fixed
                errors[inputFieldsIDs.street] = translate('bankAccount.error.zipCode');
            }

            return errors;
        },
        [inputFieldsIDs.street, inputFieldsIDs.zipCode, stepFields, translate],
    );

    return (
        <FormProvider
            formID={formID}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={customValidate ?? validate}
            onSubmit={onSubmit}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <View>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{formTitle}</Text>
                {formPOBoxDisclaimer && <Text style={[styles.textSupporting]}>{formPOBoxDisclaimer}</Text>}
                <AddressFormFields
                    inputKeys={inputFieldsIDs}
                    streetTranslationKey="common.streetAddress"
                    defaultValues={defaultValues}
                    shouldSaveDraft={!isEditing}
                />
                {shouldShowHelpLinks && <HelpLinks containerStyles={[styles.mt6]} />}
            </View>
        </FormProvider>
    );
}

AddressStep.displayName = 'AddressStep';

export default AddressStep;
