import {Str} from 'expensify-common';
import React, {useCallback, useMemo} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {getDefaultCompanyWebsite} from '@libs/BankAccountUtils';
import {getFieldRequiredErrors, isValidWebsite} from '@libs/ValidationUtils';
import {addBusinessWebsiteForDraft} from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

const COMPANY_WEBSITE_KEY = INPUT_IDS.BUSINESS_INFO_STEP.COMPANY_WEBSITE;
const STEP_FIELDS = [COMPANY_WEBSITE_KEY];

function WebsiteBusiness({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();
    const [reimbursementAccount, reimbursementAccountResult] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: true});
    const isLoadingReimbursementAccount = isLoadingOnyxValue(reimbursementAccountResult);
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});

    const defaultWebsiteExample = useMemo(() => getDefaultCompanyWebsite(session, account, true), [session, account]);
    const defaultCompanyWebsite = reimbursementAccount?.achData?.website ?? defaultWebsiteExample;

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = getFieldRequiredErrors(values, STEP_FIELDS);

            if (values.website && !isValidWebsite(Str.sanitizeURL(values.website, CONST.COMPANY_WEBSITE_DEFAULT_SCHEME))) {
                errors.website = translate('bankAccount.error.website');
            }

            return errors;
        },
        [translate],
    );
    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext: (values) => {
            const website = Str.sanitizeURL((values as {website: string})?.website, CONST.COMPANY_WEBSITE_DEFAULT_SCHEME);
            addBusinessWebsiteForDraft(website);
            onNext();
        },
        shouldSaveDraft: true,
    });

    if (isLoadingReimbursementAccount) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <SingleFieldStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('businessInfoStep.enterYourCompanyWebsite')}
            formDisclaimer={translate('common.websiteExample')}
            validate={validate}
            onSubmit={handleSubmit}
            inputId={COMPANY_WEBSITE_KEY}
            inputLabel={translate('businessInfoStep.companyWebsite')}
            defaultValue={defaultCompanyWebsite}
            inputMode={CONST.INPUT_MODE.URL}
            shouldShowHelpLinks={false}
        />
    );
}

export default WebsiteBusiness;
