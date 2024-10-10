import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceInvoicesCompanyNameForm';

type WorkspaceInvoicingDetailsNameProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVOICES_COMPANY_NAME>;

function WorkspaceInvoicingDetailsName({route}: WorkspaceInvoicingDetailsNameProps) {
    const {policyID} = route.params;

    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const styles = useThemeStyles();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_INVOICES_COMPANY_NAME_FORM>) => {
        Policy.updateInvoiceCompanyName(policyID, values[INPUT_IDS.COMPANY_NAME]);
        Navigation.goBack();
    };

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_INVOICES_COMPANY_NAME_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_INVOICES_COMPANY_NAME_FORM> =>
        ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.COMPANY_NAME]);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_INVOICES_ENABLED}
        >
            <ScreenWrapper
                testID={WorkspaceInvoicingDetailsName.displayName}
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton title={translate('workspace.invoices.companyName')} />
                <FormProvider
                    formID={ONYXKEYS.FORMS.WORKSPACE_INVOICES_COMPANY_NAME_FORM}
                    submitButtonText={translate('common.save')}
                    onSubmit={submit}
                    style={[styles.flex1, styles.mh5]}
                    enabledWhenOffline
                    validate={validate}
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.COMPANY_NAME}
                        label={translate('workspace.invoices.companyName')}
                        accessibilityLabel={translate('workspace.invoices.companyName')}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={policy?.invoice?.companyName}
                        ref={inputCallbackRef}
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceInvoicingDetailsName.displayName = 'WorkspaceInvoicingDetailsName';

export default WorkspaceInvoicingDetailsName;
