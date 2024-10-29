import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues, FormValue} from '@components/Form/types';
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

type AddressStepProps<TFormID extends keyof OnyxFormValuesMapping> = SubStepProps & {
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
    stepFields: Array<FormOnyxKeys<TFormID>>;

    /* The IDs of the input fields */
    inputFieldsIDs: AddressValues;

    /** The default values for the form */
    defaultValues: AddressValues;

    /** Should show help links */
    shouldShowHelpLinks?: boolean;

    /** Indicates if country selector should be displayed */
    shouldDisplayCountrySelector?: boolean;

    /** Indicates if state selector should be displayed */
    shouldDisplayStateSelector?: boolean;

    /** Label for the state selector */
    stateSelectorLabel?: string;

    /** The title of the state selector modal */
    stateSelectorModalHeaderTitle?: string;

    /** The title of the state selector search input */
    stateSelectorSearchInputTitle?: string;
};

function AddressStep<TFormID extends keyof OnyxFormValuesMapping>({
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
    shouldDisplayCountrySelector = false,
    shouldDisplayStateSelector = true,
    stateSelectorLabel,
    stateSelectorModalHeaderTitle,
    stateSelectorSearchInputTitle,
}: AddressStepProps<TFormID>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const validate = useCallback(
        (values: FormOnyxValues<TFormID>): FormInputErrors<TFormID> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, stepFields);

            const street = values[inputFieldsIDs.street as keyof typeof values];
            if (street && !ValidationUtils.isValidAddress(street as FormValue)) {
                // @ts-expect-error type mismatch to be fixed
                errors[inputFieldsIDs.street] = translate('bankAccount.error.addressStreet');
            }

            const zipCode = values[inputFieldsIDs.zipCode as keyof typeof values];
            if (zipCode && !shouldDisplayCountrySelector && !ValidationUtils.isValidZipCode(zipCode as string)) {
                // @ts-expect-error type mismatch to be fixed
                errors[inputFieldsIDs.zipCode] = translate('bankAccount.error.zipCode');
            }

            return errors;
        },
        [inputFieldsIDs.street, inputFieldsIDs.zipCode, shouldDisplayCountrySelector, stepFields, translate],
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
                    shouldDisplayStateSelector={shouldDisplayStateSelector}
                    shouldDisplayCountrySelector={shouldDisplayCountrySelector}
                    stateSelectorLabel={stateSelectorLabel}
                    stateSelectorModalHeaderTitle={stateSelectorModalHeaderTitle}
                    stateSelectorSearchInputTitle={stateSelectorSearchInputTitle}
                />
                {shouldShowHelpLinks && <HelpLinks containerStyles={[styles.mt6]} />}
            </View>
        </FormProvider>
    );
}

AddressStep.displayName = 'AddressStep';

export default AddressStep;
