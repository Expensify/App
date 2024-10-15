import React, {useCallback} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import HelpLinks from '@pages/ReimbursementAccount/PersonalInfo/HelpLinks';
import CONST from '@src/CONST';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
import FormProvider from './Form/FormProvider';
import InputWrapper from './Form/InputWrapper';
import type {FormOnyxKeys, FormOnyxValues} from './Form/types';
import Text from './Text';
import TextInput from './TextInput';

type FullNameStepProps = SubStepProps & {
    /** The ID of the form */
    formID: keyof OnyxFormValuesMapping;

    /** The title of the form */
    formTitle: string;

    /** The validation function to call when the form is submitted */
    customValidate?: (values: FormOnyxValues<keyof OnyxFormValuesMapping>) => Partial<Record<never, string | undefined>>;

    /** A function to call when the form is submitted */
    onSubmit: (values: FormOnyxValues<keyof OnyxFormValuesMapping>) => void;

    /** Fields list of the form */
    stepFields: Array<FormOnyxKeys<keyof OnyxFormValuesMapping>>;

    /** The ID of the first name input */
    firstNameInputID: keyof FormOnyxValues;

    /** The ID of the last name input */
    lastNameInputID: keyof FormOnyxValues;

    /** The default values for the form */
    defaultValues: {
        firstName: string;
        lastName: string;
    };

    shouldShowHelpLinks?: boolean;
};

function FullNameStep({formID, formTitle, customValidate, onSubmit, stepFields, firstNameInputID, lastNameInputID, defaultValues, isEditing, shouldShowHelpLinks = true}: FullNameStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const validate = useCallback(
        (values: FormOnyxValues<typeof formID>): Partial<Record<never, string | undefined>> => {
            const errors: Partial<Record<never, string | undefined>> = ValidationUtils.getFieldRequiredErrors(values, stepFields);
            if (values[firstNameInputID] && !ValidationUtils.isValidLegalName(values[firstNameInputID])) {
                // @ts-expect-error type mismatch to be fixed
                errors[firstNameInputID] = translate('common.error.fieldRequired');
            }

            if (values[lastNameInputID] && !ValidationUtils.isValidLegalName(values[lastNameInputID])) {
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
