import {Str} from 'expensify-common';
import React, {useCallback, useMemo} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {getDefaultCompanyWebsite} from '@libs/BankAccountUtils';
import {getFieldRequiredErrors, isValidWebsite} from '@libs/ValidationUtils';
import {setDraftValues} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type WebsiteProps = SubStepProps;

const {COMPANY_WEBSITE} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const STEP_FIELDS = [COMPANY_WEBSITE];

function Website({onNext, onMove, isEditing}: WebsiteProps) {
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const policyID = reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: false});
    const currency = policy?.outputCurrency ?? '';
    const isWebsiteRequired = currency === CONST.CURRENCY.USD || CONST.CURRENCY.CAD;

    const defaultWebsiteExample = useMemo(() => getDefaultCompanyWebsite(session, account, true), [session, account]);
    const defaultCompanyWebsite = reimbursementAccount?.achData?.website ?? defaultWebsiteExample;

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = isWebsiteRequired ? getFieldRequiredErrors(values, STEP_FIELDS) : {};

            if (values[COMPANY_WEBSITE] && !isValidWebsite(Str.sanitizeURL(values[COMPANY_WEBSITE], CONST.COMPANY_WEBSITE_DEFAULT_SCHEME))) {
                errors[COMPANY_WEBSITE] = translate('bankAccount.error.website');
            }

            return errors;
        },
        [isWebsiteRequired, translate],
    );

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext: (values) => {
            const website = Str.sanitizeURL((values as {websiteUrl: string})?.websiteUrl, CONST.COMPANY_WEBSITE_DEFAULT_SCHEME);
            setDraftValues(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM, {[COMPANY_WEBSITE]: website});
            onNext();
        },
        shouldSaveDraft: true,
    });

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
            inputId={COMPANY_WEBSITE}
            inputLabel={translate('businessInfoStep.companyWebsite')}
            inputMode={CONST.INPUT_MODE.URL}
            defaultValue={defaultCompanyWebsite}
            shouldShowHelpLinks={false}
        />
    );
}

export default Website;
