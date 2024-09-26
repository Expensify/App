import {Str} from 'expensify-common';
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
import * as LoginUtils from '@libs/LoginUtils';
import * as PhoneNumberUtils from '@libs/PhoneNumber';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {CustomSubStepProps} from '@pages/MissingPersonalDetails/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

const STEP_FIELDS = [INPUT_IDS.PHONE_NUMBER];

function PhoneNumberStep({isEditing, onNext, personalDetailsValues}: CustomSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const handleSubmit = usePersonalDetailsFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> = {};
            if (!ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.PHONE_NUMBER])) {
                errors[INPUT_IDS.PHONE_NUMBER] = translate('common.error.fieldRequired');
            }
            const phoneNumber = LoginUtils.appendCountryCode(values[INPUT_IDS.PHONE_NUMBER]);
            const parsedPhoneNumber = PhoneNumberUtils.parsePhoneNumber(phoneNumber);
            if (!parsedPhoneNumber.possible || !Str.isValidE164Phone(phoneNumber.slice(0))) {
                errors[INPUT_IDS.PHONE_NUMBER] = translate('bankAccount.error.phoneNumber');
            }
            return errors;
        },
        [translate],
    );

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
                <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('privatePersonalDetails.enterPhoneNumber')}</Text>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.PHONE_NUMBER}
                    label={translate('common.phoneNumber')}
                    aria-label={translate('common.phoneNumber')}
                    role={CONST.ROLE.PRESENTATION}
                    inputMode={CONST.INPUT_MODE.TEL}
                    defaultValue={personalDetailsValues[INPUT_IDS.PHONE_NUMBER]}
                    containerStyles={[styles.mt6]}
                />
            </View>
        </FormProvider>
    );
}

PhoneNumberStep.displayName = 'PhoneNumberStep';

export default PhoneNumberStep;
