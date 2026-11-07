/** Collect the email used to identify a beneficial owner's Expensify account. */
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {SafeString, Str} from 'expensify-common';
import React from 'react';

type EmailUBOProps = SubPageProps & {beneficialOwnerBeingModifiedID: string};

function EmailUBO({onNext, isEditing, beneficialOwnerBeingModifiedID}: EmailUBOProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {PREFIX, EMAIL} = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;
    const emailInputID = `${PREFIX}_${beneficialOwnerBeingModifiedID}_${EMAIL}` as const;
    const [emailDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {selector: (draft) => draft?.[emailInputID]});
    const submitStep = useReimbursementAccountStepFormSubmit({fieldIds: [emailInputID], onNext, shouldSaveDraft: isEditing});

    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>) => {
        submitStep({...values, [emailInputID]: SafeString(values[emailInputID]).trim()});
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        const errors = getFieldRequiredErrors(values, [emailInputID], translate);
        const email = SafeString(values[emailInputID]).trim();
        if (email && !Str.isValidEmail(email)) {
            errors[emailInputID] = translate('bankAccount.error.email');
        }
        return errors;
    };

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={onSubmit}
            validate={validate}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('common.email')}</Text>
            <InputWrapper
                InputComponent={TextInput}
                inputID={emailInputID}
                label={translate('common.email')}
                aria-label={translate('common.email')}
                role={CONST.ROLE.PRESENTATION}
                inputMode={CONST.INPUT_MODE.EMAIL}
                autoComplete="email"
                sentryLabel={CONST.SENTRY_LABEL.BANK_ACCOUNT.BENEFICIAL_OWNER_EMAIL}
                defaultValue={SafeString(emailDraft)}
                shouldSaveDraft={!isEditing}
            />
        </FormProvider>
    );
}

export default EmailUBO;
