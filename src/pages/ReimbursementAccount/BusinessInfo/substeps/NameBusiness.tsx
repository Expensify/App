import React, {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccount} from '@src/types/onyx';

type NameBusinessOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type NameBusinessProps = NameBusinessOnyxProps & SubStepProps;

const COMPANY_NAME_KEY = INPUT_IDS.BUSINESS_INFO_STEP.COMPANY_NAME;
const STEP_FIELDS = [COMPANY_NAME_KEY];

function NameBusiness({reimbursementAccount, onNext, isEditing}: NameBusinessProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const defaultCompanyName = reimbursementAccount?.achData?.companyName ?? '';
    const bankAccountID = reimbursementAccount?.achData?.bankAccountID ?? -1;

    const shouldDisableCompanyName = !!(bankAccountID && defaultCompanyName && reimbursementAccount?.achData?.state !== 'SETUP');

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

            if (values.companyName && !ValidationUtils.isValidCompanyName(values.companyName)) {
                errors.companyName = translate('bankAccount.error.companyName');
            }

            return errors;
        },
        [translate],
    );

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
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('businessInfoStep.enterTheNameOfYourBusiness')}</Text>
            <InputWrapper
                InputComponent={TextInput}
                label={translate('businessInfoStep.businessName')}
                aria-label={translate('businessInfoStep.businessName')}
                role={CONST.ROLE.PRESENTATION}
                inputID={COMPANY_NAME_KEY}
                containerStyles={[styles.mt6]}
                disabled={shouldDisableCompanyName}
                defaultValue={defaultCompanyName}
                shouldSaveDraft={!isEditing}
                shouldUseDefaultValue={shouldDisableCompanyName}
            />
        </FormProvider>
    );
}

NameBusiness.displayName = 'NameBusiness';

export default withOnyx<NameBusinessProps, NameBusinessOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(NameBusiness);
