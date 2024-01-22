import {subYears} from 'date-fns';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import HelpLinks from '@pages/ReimbursementAccount/PersonalInfo/HelpLinks';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccount, ReimbursementAccountDraft} from '@src/types/onyx';
import type {FormValues} from '@src/types/onyx/Form';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

type DateOfBirthOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountDraft>;
};

type DateOfBirthProps = DateOfBirthOnyxProps & SubStepProps;

const PERSONAL_INFO_DOB_KEY = CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.DOB;
const STEP_FIELDS = [PERSONAL_INFO_DOB_KEY];

const validate = (values: FormValues): OnyxCommon.Errors => {
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

function DateOfBirth({reimbursementAccount, reimbursementAccountDraft, onNext, isEditing}: DateOfBirthProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const dobDefaultValue = reimbursementAccount?.achData?.[PERSONAL_INFO_DOB_KEY] ?? reimbursementAccountDraft?.[PERSONAL_INFO_DOB_KEY] ?? '';

    const minDate = subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE);
    const maxDate = subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT);

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        isEditing,
    });

    return (
        // @ts-expect-error TODO: Remove this once FormProvider (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript.
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow2, styles.justifyContentBetween]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
            shouldSaveDraft={!isEditing}
        >
            <Text style={[styles.textHeadline, styles.mb3]}>{translate('personalInfoStep.enterYourDateOfBirth')}</Text>
            <InputWrapper
                // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript.
                InputComponent={DatePicker}
                formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
                inputID={PERSONAL_INFO_DOB_KEY}
                label={translate('common.dob')}
                containerStyles={[styles.mt6]}
                placeholder={translate('common.dateFormat')}
                defaultValue={dobDefaultValue}
                minDate={minDate}
                maxDate={maxDate}
            />
            <HelpLinks containerStyles={[styles.mt5]} />
        </FormProvider>
    );
}

DateOfBirth.displayName = 'DateOfBirth';

export default withOnyx<DateOfBirthProps, DateOfBirthOnyxProps>({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(DateOfBirth);
