import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import usePersonalDetailsStepFormSubmit from '@hooks/usePersonalDetailsStepFormSubmit';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {CustomSubStepProps} from '@pages/MissingPersonalDetails/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

const STEP_FIELDS = [INPUT_IDS.LEGAL_FIRST_NAME, INPUT_IDS.LEGAL_LAST_NAME];

function LegalNameStep({privatePersonalDetails, isEditing, onNext}: CustomSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    // TODO: apply validation from index file
    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);
            if (values.legalFirstName && !ValidationUtils.isValidPersonName(values.legalLastName)) {
                errors.legalFirstName = translate('bankAccount.error.firstName');
            }

            if (values.legalLastName && !ValidationUtils.isValidPersonName(values.legalLastName)) {
                errors.legalLastName = translate('bankAccount.error.lastName');
            }
            return errors;
        },
        [translate],
    );

    const handleSubmit = usePersonalDetailsStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.mb0]}
        >
            <View>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('privatePersonalDetails.enterLegalName')}</Text>
                <View style={[styles.flex2, styles.mb6]}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.LEGAL_FIRST_NAME}
                        name="lfname"
                        label={translate('privatePersonalDetails.legalFirstName')}
                        aria-label={translate('privatePersonalDetails.legalFirstName')}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={privatePersonalDetails?.legalFirstName}
                        spellCheck={false}
                        shouldSaveDraft={!isEditing}
                    />
                </View>
                <View style={[styles.flex2, styles.mb6]}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.LEGAL_LAST_NAME}
                        name="llname"
                        label={translate('privatePersonalDetails.legalLastName')}
                        aria-label={translate('privatePersonalDetails.legalLastName')}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={privatePersonalDetails?.legalLastName}
                        spellCheck={false}
                        shouldSaveDraft={!isEditing}
                    />
                </View>
            </View>
        </FormProvider>
    );
}

LegalNameStep.displayName = 'LegalNameStep';

export default LegalNameStep;
