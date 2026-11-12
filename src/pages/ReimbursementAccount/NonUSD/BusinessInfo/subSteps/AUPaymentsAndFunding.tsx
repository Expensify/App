/** Collects AU payment plans and source of funds using Corpay's live picklists. */
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import PushRowWithModal from '@components/PushRowWithModal';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';

import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import getListOptionsFromCorpayPicklist from '@pages/ReimbursementAccount/NonUSD/utils/getListOptionsFromCorpayPicklist';
import isOtherCorpayPicklistSelection from '@pages/ReimbursementAccount/NonUSD/utils/isOtherCorpayPicklistSelection';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

import React, {useState} from 'react';

const {
    APPLICANT_TYPE_ID,
    OTHER_BUSINESS_LEGAL_STRUCTURE,
    SOURCE_OF_FUNDS,
    OTHER_SOURCE_OF_FUNDS,
    NUMBER_OF_MONTHLY_TRANSACTION,
    EXPECTED_FREQUENCY_OF_TRANSACTIONS,
    CLIENT_INTENDS_TO_USE_CORPAY_ACCOUNT_TO,
} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const STEP_FIELDS = [
    SOURCE_OF_FUNDS,
    NUMBER_OF_MONTHLY_TRANSACTION,
    EXPECTED_FREQUENCY_OF_TRANSACTIONS,
    CLIENT_INTENDS_TO_USE_CORPAY_ACCOUNT_TO,
    OTHER_SOURCE_OF_FUNDS,
    OTHER_BUSINESS_LEGAL_STRUCTURE,
];

function AUPaymentsAndFunding({onNext, isEditing}: SubPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [draft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const [fields] = useOnyx(ONYXKEYS.CORPAY_ONBOARDING_FIELDS);
    const saved = reimbursementAccount?.achData?.corpay;
    const selectedLegalStructure = draft?.[APPLICANT_TYPE_ID] ?? saved?.[APPLICANT_TYPE_ID] ?? '';
    const requiresOtherLegalStructure = isOtherCorpayPicklistSelection(selectedLegalStructure, 'APPLICANT_TYPE');
    const [selectedSource, setSelectedSource] = useState(draft?.[SOURCE_OF_FUNDS] ?? saved?.[SOURCE_OF_FUNDS] ?? '');
    const requiresOtherSource = isOtherCorpayPicklistSelection(selectedSource, 'SOURCE_OF_FUNDS');

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        const requiredFields = STEP_FIELDS.slice(0, 4);
        if (isOtherCorpayPicklistSelection(values[SOURCE_OF_FUNDS], 'SOURCE_OF_FUNDS')) {
            requiredFields.push(OTHER_SOURCE_OF_FUNDS);
        }
        if (requiresOtherLegalStructure) {
            requiredFields.push(OTHER_BUSINESS_LEGAL_STRUCTURE);
        }
        const errors = getFieldRequiredErrors(values, requiredFields, translate);
        const monthlyTransactions = Number(values[NUMBER_OF_MONTHLY_TRANSACTION]);
        if (values[NUMBER_OF_MONTHLY_TRANSACTION] && (!Number.isSafeInteger(monthlyTransactions) || monthlyTransactions < 0)) {
            errors[NUMBER_OF_MONTHLY_TRANSACTION] = translate('businessInfoStep.invalidMonthlyTransactions');
        }
        return errors;
    };

    const submit = useReimbursementAccountStepFormSubmit({fieldIds: STEP_FIELDS, onNext, shouldSaveDraft: isEditing});

    if (!fields?.picklists.SourceOfFunds?.length || !fields.picklists.ExpectedFrequencyOfTransactions?.length || !fields.picklists.ClientIntendsToUseCorpayAccountTo?.length) {
        return null;
    }

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={submit}
            validate={validate}
            style={[styles.flexGrow1]}
            submitButtonStyles={[styles.mh5]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mh5, styles.mb3]}>{translate('businessInfoStep.paymentsAndFunding')}</Text>
            <InputWrapper
                InputComponent={TextInput}
                label={translate('businessInfoStep.monthlyTransactions')}
                aria-label={translate('businessInfoStep.monthlyTransactions')}
                role={CONST.ROLE.PRESENTATION}
                forceActiveLabel
                inputMode={CONST.INPUT_MODE.NUMERIC}
                inputID={NUMBER_OF_MONTHLY_TRANSACTION}
                sentryLabel={CONST.SENTRY_LABEL.CORPAY_ONBOARDING.MONTHLY_TRANSACTIONS}
                containerStyles={[styles.mt5, styles.mh5, styles.mb5]}
                defaultValue={String(draft?.[NUMBER_OF_MONTHLY_TRANSACTION] ?? saved?.[NUMBER_OF_MONTHLY_TRANSACTION] ?? '')}
                shouldSaveDraft={!isEditing}
            />
            <InputWrapper
                InputComponent={PushRowWithModal}
                optionsList={getListOptionsFromCorpayPicklist(fields.picklists.SourceOfFunds)}
                description={translate('businessInfoStep.sourceOfFunds')}
                modalHeaderTitle={translate('businessInfoStep.sourceOfFunds')}
                searchInputTitle={translate('common.search')}
                inputID={SOURCE_OF_FUNDS}
                sentryLabel={CONST.SENTRY_LABEL.CORPAY_ONBOARDING.SOURCE_OF_FUNDS}
                defaultValue={selectedSource}
                onValueChange={(value: unknown) => setSelectedSource(typeof value === 'string' ? value : '')}
                shouldSaveDraft={!isEditing}
            />
            {requiresOtherSource && (
                <InputWrapper
                    InputComponent={TextInput}
                    label={translate('businessInfoStep.otherSourceOfFunds')}
                    aria-label={translate('businessInfoStep.otherSourceOfFunds')}
                    role={CONST.ROLE.PRESENTATION}
                    forceActiveLabel
                    inputID={OTHER_SOURCE_OF_FUNDS}
                    sentryLabel={CONST.SENTRY_LABEL.CORPAY_ONBOARDING.OTHER_SOURCE_OF_FUNDS}
                    containerStyles={[styles.mt5, styles.mh5]}
                    defaultValue={draft?.[OTHER_SOURCE_OF_FUNDS] ?? saved?.[OTHER_SOURCE_OF_FUNDS] ?? ''}
                    shouldSaveDraft={!isEditing}
                />
            )}
            {requiresOtherLegalStructure && (
                <InputWrapper
                    InputComponent={TextInput}
                    label={translate('businessInfoStep.otherBusinessLegalStructure')}
                    aria-label={translate('businessInfoStep.otherBusinessLegalStructure')}
                    role={CONST.ROLE.PRESENTATION}
                    forceActiveLabel
                    inputID={OTHER_BUSINESS_LEGAL_STRUCTURE}
                    sentryLabel={CONST.SENTRY_LABEL.CORPAY_ONBOARDING.OTHER_BUSINESS_LEGAL_STRUCTURE}
                    containerStyles={[styles.mt5, styles.mh5]}
                    defaultValue={draft?.[OTHER_BUSINESS_LEGAL_STRUCTURE] ?? saved?.[OTHER_BUSINESS_LEGAL_STRUCTURE] ?? ''}
                    shouldSaveDraft={!isEditing}
                />
            )}
            <InputWrapper
                InputComponent={PushRowWithModal}
                optionsList={getListOptionsFromCorpayPicklist(fields.picklists.ExpectedFrequencyOfTransactions)}
                description={translate('businessInfoStep.transactionFrequency')}
                modalHeaderTitle={translate('businessInfoStep.transactionFrequency')}
                searchInputTitle={translate('common.search')}
                inputID={EXPECTED_FREQUENCY_OF_TRANSACTIONS}
                sentryLabel={CONST.SENTRY_LABEL.CORPAY_ONBOARDING.TRANSACTION_FREQUENCY}
                defaultValue={draft?.[EXPECTED_FREQUENCY_OF_TRANSACTIONS] ?? saved?.[EXPECTED_FREQUENCY_OF_TRANSACTIONS] ?? ''}
                shouldSaveDraft={!isEditing}
            />
            <InputWrapper
                InputComponent={PushRowWithModal}
                optionsList={getListOptionsFromCorpayPicklist(fields.picklists.ClientIntendsToUseCorpayAccountTo)}
                description={translate('businessInfoStep.corpayAccountUse')}
                modalHeaderTitle={translate('businessInfoStep.corpayAccountUse')}
                searchInputTitle={translate('common.search')}
                inputID={CLIENT_INTENDS_TO_USE_CORPAY_ACCOUNT_TO}
                sentryLabel={CONST.SENTRY_LABEL.CORPAY_ONBOARDING.ACCOUNT_USE}
                defaultValue={draft?.[CLIENT_INTENDS_TO_USE_CORPAY_ACCOUNT_TO] ?? saved?.[CLIENT_INTENDS_TO_USE_CORPAY_ACCOUNT_TO] ?? ''}
                shouldSaveDraft={!isEditing}
            />
        </FormProvider>
    );
}

export default AUPaymentsAndFunding;
