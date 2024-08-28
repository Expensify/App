import React, {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccount} from '@src/types/onyx';

type IncorporationDateBusinessOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>;
};

type IncorporationDateBusinessProps = IncorporationDateBusinessOnyxProps & SubStepProps;

const COMPANY_INCORPORATION_DATE_KEY = INPUT_IDS.BUSINESS_INFO_STEP.INCORPORATION_DATE;
const STEP_FIELDS = [COMPANY_INCORPORATION_DATE_KEY];

function IncorporationDateBusiness({reimbursementAccount, reimbursementAccountDraft, onNext, isEditing}: IncorporationDateBusinessProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

            if (values.incorporationDate && !ValidationUtils.isValidDate(values.incorporationDate)) {
                errors.incorporationDate = translate('common.error.dateInvalid');
            } else if (values.incorporationDate && !ValidationUtils.isValidPastDate(values.incorporationDate)) {
                errors.incorporationDate = translate('bankAccount.error.incorporationDateFuture');
            }

            return errors;
        },
        [translate],
    );

    const defaultCompanyIncorporationDate = reimbursementAccount?.achData?.incorporationDate ?? reimbursementAccountDraft?.incorporationDate ?? '';

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.mb0]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('businessInfoStep.selectYourCompanysIncorporationDate')}</Text>
            <InputWrapper
                InputComponent={DatePicker}
                inputID={COMPANY_INCORPORATION_DATE_KEY}
                label={translate('businessInfoStep.incorporationDate')}
                containerStyles={[styles.mt6]}
                placeholder={translate('businessInfoStep.incorporationDatePlaceholder')}
                defaultValue={defaultCompanyIncorporationDate}
                shouldSaveDraft={!isEditing}
                maxDate={new Date()}
            />
        </FormProvider>
    );
}

IncorporationDateBusiness.displayName = 'IncorporationDateBusiness';

export default withOnyx<IncorporationDateBusinessProps, IncorporationDateBusinessOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
    },
})(IncorporationDateBusiness);
