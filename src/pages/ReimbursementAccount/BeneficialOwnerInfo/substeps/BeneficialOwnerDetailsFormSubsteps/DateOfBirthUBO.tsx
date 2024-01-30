import {subYears} from 'date-fns';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx/lib/types';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountFormDraft} from '@src/types/onyx';
import type {BeneficialOwnerDraftData, ReimbursementAccountDraftValues} from '@src/types/onyx/ReimbursementAccountDraft';

const DOB = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.DOB;
const BENEFICIAL_OWNER_PREFIX = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;

type DateOfBirthUBOOnyxProps = {
    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountFormDraft>;
};
type DateOfBirthUBOProps = SubStepProps & DateOfBirthUBOOnyxProps & {beneficialOwnerBeingModifiedID: string};
type FormValues = BeneficialOwnerDraftData;

function DateOfBirthUBO({reimbursementAccountDraft, onNext, isEditing, beneficialOwnerBeingModifiedID}: DateOfBirthUBOProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const dobInputID: keyof FormValues = `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${DOB}`;
    const stepFields = [dobInputID];

    const dobDefaultValue = reimbursementAccountDraft?.[dobInputID] ?? '';

    const minDate = subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE);
    const maxDate = subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT);

    const validate = (values: ReimbursementAccountDraftValues) => {
        const errors = ValidationUtils.getFieldRequiredErrors(values, stepFields);

        if (values[dobInputID]) {
            if (!ValidationUtils.isValidPastDate(values[dobInputID]) || !ValidationUtils.meetsMaximumAgeRequirement(values[dobInputID])) {
                errors[dobInputID] = 'bankAccount.error.dob';
            } else if (!ValidationUtils.meetsMinimumAgeRequirement(values[dobInputID])) {
                errors[dobInputID] = 'bankAccount.error.age';
            }
        }

        return errors;
    };

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: stepFields,
        isEditing,
        onNext,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow2, styles.justifyContentBetween]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <Text style={[styles.textHeadline, styles.mb3]}>{translate('beneficialOwnerInfoStep.enterTheDateOfBirthOfTheOwner')}</Text>
            {/* @ts-expect-error TODO: Remove this once DatePicker (https://github.com/Expensify/App/issues/25148) is migrated to TypeScript. */}
            <InputWrapper<unknown>
                InputComponent={DatePicker}
                inputID={dobInputID}
                label={translate('common.dob')}
                containerStyles={[styles.mt6]}
                placeholder={translate('common.dateFormat')}
                defaultValue={dobDefaultValue}
                minDate={minDate}
                maxDate={maxDate}
                shouldSaveDraft={!isEditing}
            />
        </FormProvider>
    );
}

DateOfBirthUBO.displayName = 'DateOfBirthUBO';

export default withOnyx<DateOfBirthUBOProps, DateOfBirthUBOOnyxProps>({
    reimbursementAccountDraft: {
        key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
    },
})(DateOfBirthUBO);
