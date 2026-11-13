/** Collects the registered business name and incorporation date required in Australia. */
import DatePicker from '@components/DatePicker';
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

import {getFieldRequiredErrors, isValidDate, isValidPastDate} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

import React from 'react';

const {DBA_OR_REGISTERED_TRADE_NAME, DATE_OF_INCORPORATION} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const STEP_FIELDS = [DBA_OR_REGISTERED_TRADE_NAME, DATE_OF_INCORPORATION];
const TODAY = new Date();

function AURegistration({onNext, isEditing}: SubPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [draft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        const errors = getFieldRequiredErrors(values, STEP_FIELDS, translate);
        const date = values[DATE_OF_INCORPORATION];
        if (date && !isValidDate(date)) {
            errors[DATE_OF_INCORPORATION] = translate('common.error.dateInvalid');
        } else if (date && !isValidPastDate(date)) {
            errors[DATE_OF_INCORPORATION] = translate('bankAccount.error.incorporationDateFuture');
        }
        return errors;
    };

    const submit = useReimbursementAccountStepFormSubmit({fieldIds: STEP_FIELDS, onNext, shouldSaveDraft: isEditing});

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={submit}
            validate={validate}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('businessInfoStep.auRegistrationTitle')}</Text>
            <InputWrapper
                InputComponent={TextInput}
                label={translate('businessInfoStep.registeredTradeName')}
                aria-label={translate('businessInfoStep.registeredTradeName')}
                role={CONST.ROLE.PRESENTATION}
                forceActiveLabel
                inputID={DBA_OR_REGISTERED_TRADE_NAME}
                sentryLabel={CONST.SENTRY_LABEL.CORPAY_ONBOARDING.REGISTERED_TRADE_NAME}
                containerStyles={[styles.mt5]}
                defaultValue={draft?.[DBA_OR_REGISTERED_TRADE_NAME] ?? reimbursementAccount?.achData?.corpay?.[DBA_OR_REGISTERED_TRADE_NAME] ?? ''}
                shouldSaveDraft={!isEditing}
            />
            <InputWrapper
                InputComponent={DatePicker}
                inputID={DATE_OF_INCORPORATION}
                label={translate('businessInfoStep.incorporationDate')}
                wrapperStyle={styles.mt5}
                placeholder={translate('businessInfoStep.incorporationDatePlaceholder')}
                defaultValue={draft?.[DATE_OF_INCORPORATION] ?? reimbursementAccount?.achData?.corpay?.[DATE_OF_INCORPORATION] ?? ''}
                shouldSaveDraft={!isEditing}
                maxDate={TODAY}
            />
        </FormProvider>
    );
}

export default AURegistration;
