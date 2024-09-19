import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import usePersonalDetailsFormSubmit from '@hooks/usePersonalDetailsFormSubmit';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {CustomSubStepProps} from '@pages/MissingPersonalDetails/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

const STEP_FIELDS = [INPUT_IDS.LEGAL_FIRST_NAME, INPUT_IDS.LEGAL_LAST_NAME];

function LegalNameStep({isEditing, onNext, privatePersonalDetails}: CustomSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> = {};
            if (!ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.LEGAL_FIRST_NAME])) {
                errors[INPUT_IDS.LEGAL_FIRST_NAME] = translate('common.error.fieldRequired');
            } else if (!ValidationUtils.isValidLegalName(values[INPUT_IDS.LEGAL_FIRST_NAME])) {
                errors[INPUT_IDS.LEGAL_FIRST_NAME] = translate('privatePersonalDetails.error.hasInvalidCharacter');
            } else if (values[INPUT_IDS.LEGAL_FIRST_NAME].length > CONST.LEGAL_NAME.MAX_LENGTH) {
                errors[INPUT_IDS.LEGAL_FIRST_NAME] = translate('common.error.characterLimitExceedCounter', {
                    length: values[INPUT_IDS.LEGAL_FIRST_NAME].length,
                    limit: CONST.LEGAL_NAME.MAX_LENGTH,
                });
            }
            if (ValidationUtils.doesContainReservedWord(values[INPUT_IDS.LEGAL_FIRST_NAME], CONST.DISPLAY_NAME.RESERVED_NAMES)) {
                ErrorUtils.addErrorMessage(errors, INPUT_IDS.LEGAL_FIRST_NAME, translate('personalDetails.error.containsReservedWord'));
            }
            if (!ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.LEGAL_LAST_NAME])) {
                errors[INPUT_IDS.LEGAL_LAST_NAME] = translate('common.error.fieldRequired');
            } else if (!ValidationUtils.isValidLegalName(values[INPUT_IDS.LEGAL_LAST_NAME])) {
                errors[INPUT_IDS.LEGAL_LAST_NAME] = translate('privatePersonalDetails.error.hasInvalidCharacter');
            } else if (values[INPUT_IDS.LEGAL_LAST_NAME].length > CONST.LEGAL_NAME.MAX_LENGTH) {
                errors[INPUT_IDS.LEGAL_LAST_NAME] = translate('common.error.characterLimitExceedCounter', {
                    length: values[INPUT_IDS.LEGAL_LAST_NAME].length,
                    limit: CONST.LEGAL_NAME.MAX_LENGTH,
                });
            }
            if (ValidationUtils.doesContainReservedWord(values[INPUT_IDS.LEGAL_LAST_NAME], CONST.DISPLAY_NAME.RESERVED_NAMES)) {
                ErrorUtils.addErrorMessage(errors, INPUT_IDS.LEGAL_LAST_NAME, translate('personalDetails.error.containsReservedWord'));
            }
            return errors;
        },
        [translate],
    );

    const handleSubmit = usePersonalDetailsFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.flexGrow1, styles.mt3]}
            submitButtonStyles={[styles.ph5, styles.mb0]}
            enabledWhenOffline
        >
            <View style={styles.ph5}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('privatePersonalDetails.enterLegalName')}</Text>
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
