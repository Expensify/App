import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import StateSelector from '@components/StateSelector';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccount} from '@src/types/onyx';

type IncorporationStateBusinessOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type IncorporationStateBusinessProps = IncorporationStateBusinessOnyxProps & SubStepProps;

const COMPANY_INCORPORATION_STATE_KEY = INPUT_IDS.BUSINESS_INFO_STEP.INCORPORATION_STATE;
const STEP_FIELDS = [COMPANY_INCORPORATION_STATE_KEY];

const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> =>
    ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

function IncorporationStateBusiness({reimbursementAccount, onNext, isEditing}: IncorporationStateBusinessProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const defaultCompanyIncorporationState = reimbursementAccount?.achData?.incorporationState ?? '';

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
            style={[styles.mh0, styles.flexGrow1]}
            submitButtonStyles={[styles.ph5, styles.mb0]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5]}>{translate('businessInfoStep.pleaseSelectTheStateYourCompanyWasIncorporatedIn')}</Text>
            <InputWrapper
                InputComponent={StateSelector}
                inputID={COMPANY_INCORPORATION_STATE_KEY}
                label={translate('businessInfoStep.incorporationState')}
                defaultValue={defaultCompanyIncorporationState}
                shouldSaveDraft={!isEditing}
                wrapperStyle={[styles.ph5, styles.mt3]}
            />
        </FormProvider>
    );
}

IncorporationStateBusiness.displayName = 'IncorporationStateBusiness';

export default withOnyx<IncorporationStateBusinessProps, IncorporationStateBusinessOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(IncorporationStateBusiness);
