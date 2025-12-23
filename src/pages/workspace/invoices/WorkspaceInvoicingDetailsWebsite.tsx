import {Str} from 'expensify-common';
import React from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {extractUrlDomain} from '@libs/Url';
import {getFieldRequiredErrors, isPublicDomain, isValidWebsite} from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {updateInvoiceCompanyWebsite} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceInvoicesCompanyWebsiteForm';

type WorkspaceInvoicingDetailsWebsiteProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVOICES_COMPANY_WEBSITE>;

function WorkspaceInvoicingDetailsWebsite({route}: WorkspaceInvoicingDetailsWebsiteProps) {
    const {policyID} = route.params;

    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const styles = useThemeStyles();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_INVOICES_COMPANY_WEBSITE_FORM>) => {
        const companyWebsite = Str.sanitizeURL(values[INPUT_IDS.COMPANY_WEBSITE], CONST.COMPANY_WEBSITE_DEFAULT_SCHEME);
        updateInvoiceCompanyWebsite(policyID, companyWebsite);
        Navigation.goBack();
    };

    const validate = (
        values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_INVOICES_COMPANY_WEBSITE_FORM>,
    ): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_INVOICES_COMPANY_WEBSITE_FORM> => {
        const errors = getFieldRequiredErrors(values, [INPUT_IDS.COMPANY_WEBSITE]);

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
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED}
        >
            <ScreenWrapper
                testID="WorkspaceInvoicingDetailsWebsite"
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton title={translate('workspace.invoices.companyWebsite')} />
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_INVOICES_COMPANY_WEBSITE_FORM}
                    submitButtonText={translate('common.save')}
                    onSubmit={submit}
                    style={[styles.flex1, styles.mh5]}
                    enabledWhenOffline
                    validate={validate}
                    shouldHideFixErrorsAlert
                    addBottomSafeAreaPadding
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.COMPANY_WEBSITE}
                        label={translate('workspace.invoices.companyWebsite')}
                        accessibilityLabel={translate('workspace.invoices.companyWebsite')}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={policy?.invoice?.companyWebsite}
                        ref={inputCallbackRef}
                        inputMode={CONST.INPUT_MODE.URL}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceInvoicingDetailsWebsite;
