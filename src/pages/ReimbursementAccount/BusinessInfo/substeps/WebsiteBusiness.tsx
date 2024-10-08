import React, {useCallback, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDefaultCompanyWebsite} from '@libs/BankAccountUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const COMPANY_WEBSITE_KEY = INPUT_IDS.BUSINESS_INFO_STEP.COMPANY_WEBSITE;
const STEP_FIELDS = [COMPANY_WEBSITE_KEY];

function WebsiteBusiness({onNext, isEditing}: SubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [user] = useOnyx(ONYXKEYS.USER);

    const defaultWebsiteExample = useMemo(() => getDefaultCompanyWebsite(session, user), [session, user]);
    const defaultCompanyWebsite = reimbursementAccount?.achData?.website ?? defaultWebsiteExample;

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

            if (values.website && !ValidationUtils.isValidWebsite(values.website)) {
                errors.website = translate('bankAccount.error.website');
            }

            return errors;
        },
        [translate],
    );
    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext: (values) => {
            BankAccounts.addBusinessWebsiteForDraft((values as {website: string})?.website);
            onNext();
        },
        shouldSaveDraft: true,
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
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('businessInfoStep.enterYourCompanysWebsite')}</Text>
            <Text style={[styles.label, styles.textSupporting]}>{translate('common.websiteExample')}</Text>
            <InputWrapper
                InputComponent={TextInput}
                inputID={COMPANY_WEBSITE_KEY}
                label={translate('businessInfoStep.companyWebsite')}
                aria-label={translate('businessInfoStep.companyWebsite')}
                role={CONST.ROLE.PRESENTATION}
                containerStyles={[styles.mt6]}
                defaultValue={defaultCompanyWebsite}
                shouldSaveDraft={!isEditing}
                inputMode={CONST.INPUT_MODE.URL}
            />
        </FormProvider>
    );
}

WebsiteBusiness.displayName = 'WebsiteBusiness';

export default WebsiteBusiness;
