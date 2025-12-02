import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {doesContainReservedWord, getFieldRequiredErrors, isRequiredFulfilled, isValidLegalName} from '@libs/ValidationUtils';
import PatriotActLink from '@pages/EnablePayments/PatriotActLink';
import HelpLinks from '@pages/ReimbursementAccount/USD/Requestor/PersonalInfo/HelpLinks';
import CONST from '@src/CONST';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';

type FullNameStepProps<TFormID extends keyof OnyxFormValuesMapping> = SubStepProps & {
    /** The ID of the form */
    formID: TFormID;

    /** The title of the form */
    formTitle: string;

    /** The validation function to call when the form is submitted */
    customValidate?: (values: FormOnyxValues<TFormID>) => FormInputErrors<TFormID>;

    /** A function to call when the form is submitted */
    onSubmit: (values: FormOnyxValues<TFormID>) => void;

    /** Fields list of the form */
    stepFields: Array<FormOnyxKeys<TFormID>>;

    /** The ID of the first name input */
    firstNameInputID: string;

    /** The ID of the last name input */
    lastNameInputID: string;

    /** The default values for the form */
    defaultValues: {
        firstName: string;
        lastName: string;
    };

    /** Should show the help link or not */
    shouldShowHelpLinks?: boolean;

    /** Custom label of the first name input  */
    customFirstNameLabel?: string;

    /** Custom label of the last name input */
    customLastNameLabel?: string;

    /** Whether to show the Patriot Act help link (EnablePayments-only) */
    shouldShowPatriotActLink?: boolean;
};

function FullNameStep<TFormID extends keyof OnyxFormValuesMapping>({
    formID,
    formTitle,
    customValidate,
    onSubmit,
    stepFields,
    firstNameInputID,
    lastNameInputID,
    defaultValues,
    isEditing,
    shouldShowHelpLinks = true,
    customFirstNameLabel,
    customLastNameLabel,
    shouldShowPatriotActLink = false,
}: FullNameStepProps<TFormID>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const validate = useCallback(
        (values: FormOnyxValues<TFormID>): FormInputErrors<TFormID> => {
            const errors = getFieldRequiredErrors(values, stepFields);

            const firstName = values[firstNameInputID as keyof FormOnyxValues<TFormID>] as string;
            if (!isRequiredFulfilled(firstName)) {
                // @ts-expect-error type mismatch to be fixed
                errors[firstNameInputID] = translate('common.error.fieldRequired');
            } else if (!isValidLegalName(firstName)) {
                // @ts-expect-error type mismatch to be fixed
                errors[firstNameInputID] = translate('privatePersonalDetails.error.hasInvalidCharacter');
            } else if (firstName.length > CONST.LEGAL_NAME.MAX_LENGTH) {
                // @ts-expect-error type mismatch to be fixed
                errors[firstNameInputID] = translate('common.error.characterLimitExceedCounter', {
                    length: firstName.length,
                    limit: CONST.LEGAL_NAME.MAX_LENGTH,
                });
            }

            if (doesContainReservedWord(firstName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
                // @ts-expect-error type mismatch to be fixed
                errors[firstNameInputID] = translate('personalDetails.error.containsReservedWord');
            }

            const lastName = values[lastNameInputID as keyof FormOnyxValues<TFormID>] as string;
            if (!isRequiredFulfilled(lastName)) {
                // @ts-expect-error type mismatch to be fixed
                errors[lastNameInputID] = translate('common.error.fieldRequired');
            } else if (!isValidLegalName(lastName)) {
                // @ts-expect-error type mismatch to be fixed
                errors[lastNameInputID] = translate('privatePersonalDetails.error.hasInvalidCharacter');
            } else if (lastName.length > CONST.LEGAL_NAME.MAX_LENGTH) {
                // @ts-expect-error type mismatch to be fixed
                errors[lastNameInputID] = translate('common.error.characterLimitExceedCounter', {
                    length: lastName.length,
                    limit: CONST.LEGAL_NAME.MAX_LENGTH,
                });
            }

            if (doesContainReservedWord(lastName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
                // @ts-expect-error type mismatch to be fixed
                errors[lastNameInputID] = translate('personalDetails.error.containsReservedWord');
            }
            return errors;
        },
        [firstNameInputID, lastNameInputID, stepFields, translate],
    );

    return (
        <FormProvider
            formID={formID}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={customValidate ?? validate}
            onSubmit={onSubmit}
            style={[styles.mh5, styles.flexGrow1]}
            enabledWhenOffline
        >
            <View>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{formTitle}</Text>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={firstNameInputID}
                    label={customFirstNameLabel ?? translate('personalInfoStep.legalFirstName')}
                    aria-label={customFirstNameLabel ?? translate('personalInfoStep.legalFirstName')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={defaultValues.firstName}
                    shouldSaveDraft={!isEditing}
                    containerStyles={[styles.mb6]}
                />
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={lastNameInputID}
                    label={customLastNameLabel ?? translate('personalInfoStep.legalLastName')}
                    aria-label={customLastNameLabel ?? translate('personalInfoStep.legalLastName')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={defaultValues.lastName}
                    shouldSaveDraft={!isEditing}
                    containerStyles={[styles.mb6]}
                />
                {shouldShowHelpLinks && (
                    <>
                        <HelpLinks />
                        {shouldShowPatriotActLink && <PatriotActLink containerStyles={[styles.mt2]} />}
                    </>
                )}
            </View>
        </FormProvider>
    );
}

FullNameStep.displayName = 'FullNameStep';

export default FullNameStep;
