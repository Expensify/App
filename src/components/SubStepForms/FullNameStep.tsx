import React, {useCallback} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import HelpLinks from '@pages/ReimbursementAccount/PersonalInfo/HelpLinks';
import CONST from '@src/CONST';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
import FormProvider from '../Form/FormProvider';
import InputWrapper from '../Form/InputWrapper';
import type {FormInputErrors, FormOnyxKeys, FormOnyxValues} from '../Form/types';
import Text from '../Text';
import TextInput from '../TextInput';

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

    shouldShowHelpLinks?: boolean;
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
}: FullNameStepProps<TFormID>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const validate = useCallback(
        (values: FormOnyxValues<TFormID>): FormInputErrors<TFormID> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, stepFields);

            const firstName = values[firstNameInputID as keyof FormOnyxValues<TFormID>] as string;
            if (firstName && !ValidationUtils.isValidLegalName(firstName)) {
                // @ts-expect-error type mismatch to be fixed
                errors[firstNameInputID] = translate('common.error.fieldRequired');
            }

            const lastName = values[lastNameInputID as keyof FormOnyxValues<TFormID>] as string;
            if (lastName && !ValidationUtils.isValidLegalName(lastName)) {
                // @ts-expect-error type mismatch to be fixed
                errors[lastNameInputID] = translate('common.error.fieldRequired');
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
        >
            <View>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{formTitle}</Text>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={firstNameInputID}
                    label={translate('common.firstName')}
                    aria-label={translate('common.firstName')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={defaultValues.firstName}
                    shouldSaveDraft={!isEditing}
                    containerStyles={[styles.mb6]}
                />
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={lastNameInputID}
                    label={translate('common.lastName')}
                    aria-label={translate('common.lastName')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={defaultValues.lastName}
                    shouldSaveDraft={!isEditing}
                    containerStyles={[styles.mb6]}
                />
                {shouldShowHelpLinks && <HelpLinks />}
            </View>
        </FormProvider>
    );
}

FullNameStep.displayName = 'FullNameStep';

export default FullNameStep;
