import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues, FormRef, FormValue} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFieldRequiredErrors, isValidAddress, isValidZipCode, isValidZipCodeInternational} from '@libs/ValidationUtils';
import AddressFormFields from '@pages/ReimbursementAccount/AddressFormFields';
import HelpLinks from '@pages/ReimbursementAccount/USD/Requestor/PersonalInfo/HelpLinks';
import type {TranslationPaths} from '@src/languages/types';
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

    /** The IDs of the input fields */
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

    /** Callback to be called when the country is changed */
    onCountryChange?: (country: unknown) => void;

    /** Translation key of street field */
    streetTranslationKey?: TranslationPaths;
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
    onCountryChange,
    streetTranslationKey = 'common.streetAddress',
}: AddressStepProps<TFormID>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const formRef = useRef<FormRef | null>(null);

    useEffect(() => {
        // When stepFields change (e.g. country changes) we need to reset state errors manually
        formRef.current?.resetFormFieldError(inputFieldsIDs.state);
    }, [inputFieldsIDs.state, stepFields]);

    const validate = useCallback(
        (values: FormOnyxValues<TFormID>): FormInputErrors<TFormID> => {
            const errors = getFieldRequiredErrors(values, stepFields);

            const street = values[inputFieldsIDs.street as keyof typeof values];
            if (street && !isValidAddress(street as FormValue)) {
                // @ts-expect-error type mismatch to be fixed
                errors[inputFieldsIDs.street] = translate('bankAccount.error.addressStreet');
            }

            const zipCode = values[inputFieldsIDs.zipCode as keyof typeof values];
            if (zipCode && (shouldDisplayCountrySelector ? !isValidZipCodeInternational(zipCode as string) : !isValidZipCode(zipCode as string))) {
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
            ref={formRef}
        >
            <View>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{formTitle}</Text>
                {!!formPOBoxDisclaimer && <Text style={[styles.textSupporting]}>{formPOBoxDisclaimer}</Text>}
                <AddressFormFields
                    inputKeys={inputFieldsIDs}
                    streetTranslationKey={streetTranslationKey}
                    defaultValues={defaultValues}
                    shouldSaveDraft={!isEditing}
                    shouldDisplayStateSelector={shouldDisplayStateSelector}
                    shouldDisplayCountrySelector={shouldDisplayCountrySelector}
                    stateSelectorLabel={stateSelectorLabel}
                    stateSelectorModalHeaderTitle={stateSelectorModalHeaderTitle}
                    stateSelectorSearchInputTitle={stateSelectorSearchInputTitle}
                    onCountryChange={onCountryChange}
                />
                {!!shouldShowHelpLinks && <HelpLinks containerStyles={[styles.mt6]} />}
            </View>
        </FormProvider>
    );
}

AddressStep.displayName = 'AddressStep';

export default AddressStep;
