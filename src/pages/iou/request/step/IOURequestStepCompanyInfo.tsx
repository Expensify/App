import {Str} from 'expensify-common';
import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import * as Url from '@libs/Url';
import * as ValidationUtils from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import * as IOU from '@userActions/IOU';
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

    const policy = usePolicy(IOU.getIOURequestPolicyID(transaction, report));
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${IOU.getIOURequestPolicyID(transaction, report)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${IOU.getIOURequestPolicyID(transaction, report)}`);

    const formattedAmount = CurrencyUtils.convertToDisplayString(Math.abs(transaction?.amount ?? 0), transaction?.currency);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_COMPANY_INFO_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_COMPANY_INFO_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.COMPANY_NAME, INPUT_IDS.COMPANY_WEBSITE]);

            if (values.companyWebsite) {
                if (!ValidationUtils.isValidWebsite(values.companyWebsite)) {
                    errors.companyWebsite = translate('bankAccount.error.website');
                } else {
                    const domain = Url.extractUrlDomain(values.companyWebsite);

                    if (!domain || !Str.isValidDomainName(domain)) {
                        errors.companyWebsite = translate('iou.invalidDomainError');
                    } else if (ValidationUtils.isPublicDomain(domain)) {
                        errors.companyWebsite = translate('iou.publicDomainError');
                    }
                }
            }

            return errors;
        },
        [translate],
    );

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_COMPANY_INFO_FORM>) => {
        playSound(SOUNDS.DONE);
        IOU.sendInvoice(currentUserPersonalDetails.accountID, transaction, report, undefined, policy, policyTags, policyCategories, values.companyName, values.companyWebsite);
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.companyInfo')}
            onBackButtonPress={() => Navigation.goBack(backTo)}
            shouldShowWrapper
            testID={IOURequestStepCompanyInfo.displayName}
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
                />
            </FormProvider>
        </StepScreenWrapper>
    );
}

IOURequestStepCompanyInfo.displayName = 'IOURequestStepCompanyInfo';

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepCompanyInfo));
