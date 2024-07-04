import {subYears} from 'date-fns';
import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import useWalletAdditionalDetailsStepFormSubmit from '@hooks/useWalletAdditionalDetailsStepFormSubmit';
import * as ValidationUtils from '@libs/ValidationUtils';
import HelpLinks from '@pages/ReimbursementAccount/PersonalInfo/HelpLinks';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WalletAdditionalDetailsForm';

const PERSONAL_INFO_DOB_KEY = INPUT_IDS.PERSONAL_INFO_STEP.DOB;
const STEP_FIELDS = [PERSONAL_INFO_DOB_KEY];

const minDate = subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE);
const maxDate = subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT);

function DateOfBirthStep({onNext, isEditing}: SubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>): FormInputErrors<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

            if (values.dob) {
                if (!ValidationUtils.isValidPastDate(values.dob) || !ValidationUtils.meetsMaximumAgeRequirement(values.dob)) {
                    errors.dob = translate('bankAccount.error.dob');
                } else if (!ValidationUtils.meetsMinimumAgeRequirement(values.dob)) {
                    errors.dob = translate('bankAccount.error.age');
                }
            }

            return errors;
        },
        [translate],
    );

    const [walletAdditionalDetails] = useOnyx(ONYXKEYS.WALLET_ADDITIONAL_DETAILS);

    const dobDefaultValue = walletAdditionalDetails?.[PERSONAL_INFO_DOB_KEY] ?? walletAdditionalDetails?.[PERSONAL_INFO_DOB_KEY] ?? '';

    const handleSubmit = useWalletAdditionalDetailsStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow2, styles.justifyContentBetween]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb5]}>{translate('personalInfoStep.whatsYourDOB')}</Text>
            <InputWrapper
                InputComponent={DatePicker}
                inputID={PERSONAL_INFO_DOB_KEY}
                label={translate('common.dob')}
                placeholder={translate('common.dateFormat')}
                defaultValue={dobDefaultValue}
                minDate={minDate}
                maxDate={maxDate}
                shouldSaveDraft={!isEditing}
            />
            <HelpLinks containerStyles={[styles.mt5]} />
        </FormProvider>
    );
}

DateOfBirthStep.displayName = 'DateOfBirthStep';

export default DateOfBirthStep;
