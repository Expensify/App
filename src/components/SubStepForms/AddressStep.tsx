import FormProvider from '@components/Form/FormProvider';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues, FormRef} from '@components/Form/types';
import PatriotActLink from '@components/PatriotActLink';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';
import genericMemo from '@libs/genericMemo';
import {getCountryZipRegexDetails, getFieldRequiredErrors, getInvalidAddressErrorTranslationPath, isValidZipCode, isValidZipCodeForCountry} from '@libs/ValidationUtils';

import AddressFormFields from '@pages/ReimbursementAccount/AddressFormFields';
import HelpLinks from '@pages/ReimbursementAccount/USD/Requestor/PersonalInfo/HelpLinks';

import {setDraftValues} from '@userActions/FormActions';

import type {Country} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';

import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';

type AddressValues = {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: Country | '';
};

type AddressInputIDs = {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
};

function getStringFormValue<TFormID extends keyof OnyxFormValuesMapping>(values: FormOnyxValues<TFormID>, fieldID?: string): string {
    if (!fieldID) {
        return '';
    }

    const value = values[fieldID as keyof FormOnyxValues<TFormID>];
    return typeof value === 'string' ? value : '';
}

type AddressStepProps<TFormID extends keyof OnyxFormValuesMapping> = SubStepProps &
    ForwardedFSClassProps & {
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
        inputFieldsIDs: AddressInputIDs;

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

        /** Indicates if country can be changed by user */
        shouldAllowCountryChange?: boolean;

        /** Indicates if zip code format should be validated */
        shouldValidateZipCodeFormat?: boolean;

        /** Whether to show the Patriot Act help link (EnablePayments-only) */
        shouldShowPatriotActLink?: boolean;
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
    shouldAllowCountryChange = true,
    shouldValidateZipCodeFormat = true,
    shouldShowPatriotActLink = false,
    forwardedFSClass,
}: AddressStepProps<TFormID>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const formRef = useRef<FormRef | null>(null);

    useEffect(() => {
        // When stepFields change (e.g. country changes) we need to reset state errors manually
        formRef.current?.resetFormFieldError(inputFieldsIDs.state);
    }, [inputFieldsIDs.state, stepFields]);

    useEffect(() => {
        // When country is not editable we need to manually set its draft value in case user enters address manually
        if (shouldAllowCountryChange || inputFieldsIDs.country === undefined) {
            return;
        }

        setDraftValues(formID, {[inputFieldsIDs.country]: defaultValues.country});
    }, [defaultValues.country, formID, inputFieldsIDs.country, shouldAllowCountryChange]);

    const validate = useCallback(
        (values: FormOnyxValues<TFormID>): FormInputErrors<TFormID> => {
            const errors = getFieldRequiredErrors(values, stepFields, translate);

            const street = getStringFormValue(values, inputFieldsIDs.street);
            const streetError = getInvalidAddressErrorTranslationPath(street);
            if (street && streetError) {
                // @ts-expect-error type mismatch to be fixed
                errors[inputFieldsIDs.street] = translate(streetError);
            }

            const zipCode = getStringFormValue(values, inputFieldsIDs.zipCode);
            const selectedCountry = (inputFieldsIDs.country ? getStringFormValue(values, inputFieldsIDs.country) : defaultValues.country) as Country | '';
            const shouldValidateSelectedCountryZip = shouldDisplayCountrySelector && !!inputFieldsIDs.country;

            if (zipCode && shouldValidateSelectedCountryZip && !isValidZipCodeForCountry(zipCode, selectedCountry)) {
                const zipCodeSamples = getCountryZipRegexDetails(selectedCountry)?.samples;
                // @ts-expect-error type mismatch to be fixed
                errors[inputFieldsIDs.zipCode] = translate('privatePersonalDetails.error.incorrectZipFormat', zipCodeSamples);
            } else if (zipCode && shouldValidateZipCodeFormat && !isValidZipCode(zipCode)) {
                // @ts-expect-error type mismatch to be fixed
                errors[inputFieldsIDs.zipCode] = translate('bankAccount.error.zipCode');
            }

            return errors;
        },
        [defaultValues.country, inputFieldsIDs.country, inputFieldsIDs.street, inputFieldsIDs.zipCode, shouldDisplayCountrySelector, shouldValidateZipCodeFormat, stepFields, translate],
    );

    return (
        <FormProvider
            formID={formID}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={customValidate ?? validate}
            onSubmit={onSubmit}
            style={[styles.mh5, styles.flexGrow1]}
            ref={formRef}
            enabledWhenOffline
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
                    shouldAllowCountryChange={shouldAllowCountryChange}
                    forwardedFSClass={forwardedFSClass}
                />
                {!!shouldShowHelpLinks && (
                    <>
                        <HelpLinks containerStyles={[styles.mt6]} />
                        {shouldShowPatriotActLink && <PatriotActLink containerStyles={[styles.mt2]} />}
                    </>
                )}
            </View>
        </FormProvider>
    );
}

export default genericMemo(AddressStep);
