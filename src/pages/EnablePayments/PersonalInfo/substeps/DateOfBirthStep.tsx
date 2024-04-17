import {subYears} from 'date-fns';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
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
import type {WalletAdditionalDetailsRefactor} from '@src/types/onyx/WalletAdditionalDetails';

type DateOfBirthOnyxProps = {
    /** Reimbursement account from ONYX */
    walletAdditionalDetails: OnyxEntry<WalletAdditionalDetailsRefactor>;
};

type DateOfBirthProps = DateOfBirthOnyxProps & SubStepProps;

const PERSONAL_INFO_DOB_KEY = INPUT_IDS.PERSONAL_INFO_STEP.DOB;
const STEP_FIELDS = [PERSONAL_INFO_DOB_KEY];

const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>): FormInputErrors<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS> => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

    if (values.dob) {
        if (!ValidationUtils.isValidPastDate(values.dob) || !ValidationUtils.meetsMaximumAgeRequirement(values.dob)) {
            errors.dob = 'bankAccount.error.dob';
        } else if (!ValidationUtils.meetsMinimumAgeRequirement(values.dob)) {
            errors.dob = 'bankAccount.error.age';
        }
    }

    return errors;
};

const minDate = subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE);
const maxDate = subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT);

function DateOfBirthStep({walletAdditionalDetails, onNext, isEditing}: DateOfBirthProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

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
            submitButtonStyles={[styles.pb5, styles.mb0]}
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

export default withOnyx<DateOfBirthProps, DateOfBirthOnyxProps>({
    // @ts-expect-error ONYXKEYS.WALLET_ADDITIONAL_DETAILS is conflicting with ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS
    walletAdditionalDetails: {
        key: ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS,
    },
})(DateOfBirthStep);
