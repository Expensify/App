import {Str} from 'expensify-common';
import React, {useCallback, useMemo} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {getDefaultCompanyWebsite} from '@libs/BankAccountUtils';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {extractUrlDomain} from '@libs/Url';
import {getFieldRequiredErrors, isPublicDomain, isValidWebsite} from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import {getIOURequestPolicyID} from '@userActions/IOU';
import {sendInvoice} from '@userActions/IOU/SendInvoice';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestCompanyInfoForm';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

type IOURequestStepCompanyInfoProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_COMPANY_INFO> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_COMPANY_INFO>;

function IOURequestStepCompanyInfo({route, report, transaction}: IOURequestStepCompanyInfoProps) {
    const {backTo} = route.params;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const defaultWebsiteExample = useMemo(() => getDefaultCompanyWebsite(session, account), [session, account]);

    const policyID = getIOURequestPolicyID(transaction, report);
    const policy = usePolicy(policyID);
    const [policyRecentlyUsedCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policyID}`, {canBeMissing: true});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`, {canBeMissing: true});
    const [policyRecentlyUsedTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`, {canBeMissing: true});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES, {canBeMissing: true});

    const formattedAmount = convertToDisplayString(Math.abs(transaction?.amount ?? 0), transaction?.currency);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_COMPANY_INFO_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_COMPANY_INFO_FORM> => {
            const errors = getFieldRequiredErrors(values, [INPUT_IDS.COMPANY_NAME, INPUT_IDS.COMPANY_WEBSITE]);
            if (values.companyWebsite) {
                const companyWebsite = Str.sanitizeURL(values.companyWebsite, CONST.COMPANY_WEBSITE_DEFAULT_SCHEME);
                if (!isValidWebsite(companyWebsite)) {
                    errors.companyWebsite = translate('bankAccount.error.website');
                } else {
                    const domain = extractUrlDomain(companyWebsite);

                    if (!domain || !Str.isValidDomainName(domain)) {
                        errors.companyWebsite = translate('iou.invalidDomainError');
                    } else if (isPublicDomain(domain)) {
                        errors.companyWebsite = translate('iou.publicDomainError');
                    }
                }
            }

            return errors;
        },
        [translate],
    );

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_COMPANY_INFO_FORM>) => {
        const companyWebsite = Str.sanitizeURL(values.companyWebsite, CONST.COMPANY_WEBSITE_DEFAULT_SCHEME);
        sendInvoice({
            currentUserAccountID: currentUserPersonalDetails.accountID,
            transaction,
            policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
            invoiceChatReport: report,
            policy,
            policyTagList: policyTags,
            policyCategories,
            companyName: values.companyName,
            companyWebsite,
            policyRecentlyUsedCategories,
            policyRecentlyUsedTags,
        });
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.companyInfo')}
            onBackButtonPress={() => Navigation.goBack(backTo)}
            shouldShowWrapper
            testID="IOURequestStepCompanyInfo"
        >
            <Text style={[styles.textNormalThemeText, styles.ph5]}>{translate('iou.companyInfoDescription')}</Text>
            <FormProvider
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.MONEY_REQUEST_COMPANY_INFO_FORM}
                onSubmit={submit}
                validate={validate}
                submitButtonText={translate('iou.sendInvoice', {amount: formattedAmount})}
                enabledWhenOffline
            >
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.COMPANY_NAME}
                    name={INPUT_IDS.COMPANY_NAME}
                    label={translate('iou.yourCompanyName')}
                    accessibilityLabel={translate('iou.yourCompanyName')}
                    role={CONST.ROLE.PRESENTATION}
                    ref={inputCallbackRef}
                    containerStyles={styles.mv4}
                />
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.COMPANY_WEBSITE}
                    name={INPUT_IDS.COMPANY_WEBSITE}
                    inputMode={CONST.INPUT_MODE.URL}
                    label={translate('iou.yourCompanyWebsite')}
                    accessibilityLabel={translate('iou.yourCompanyWebsite')}
                    role={CONST.ROLE.PRESENTATION}
                    hint={translate('iou.yourCompanyWebsiteNote')}
                    defaultValue={defaultWebsiteExample}
                />
            </FormProvider>
        </StepScreenWrapper>
    );
}

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepCompanyInfo));
