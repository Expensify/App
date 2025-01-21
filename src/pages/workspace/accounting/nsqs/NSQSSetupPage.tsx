import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {connectPolicyToNSQS} from '@libs/actions/connections/NSQS';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/NSQSOAuth2Form';

function NSQSSetupPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NSQS_OAUTH2_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.NSQS_OAUTH2_FORM> = {};
            if (!values[INPUT_IDS.NSQS_ACCOUNT_ID]) {
                ErrorUtils.addErrorMessage(errors, INPUT_IDS.NSQS_ACCOUNT_ID, translate('common.error.fieldRequired'));
            }
            return errors;
        },
        [translate],
    );

    const connectPolicy = useCallback(
        (formValues: FormOnyxValues<typeof ONYXKEYS.FORMS.NSQS_OAUTH2_FORM>) => {
            connectPolicyToNSQS(policyID, formValues[INPUT_IDS.NSQS_ACCOUNT_ID]);
            Navigation.dismissModal();
        },
        [policyID],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID={NSQSSetupPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.nsqs.setup.title')}
                onBackButtonPress={() =>
                    Navigation.goBack(
                        ROUTES.WORKSPACE_ACCOUNTING_MULTI_CONNECTION_SELECTOR.getRoute(policyID, CONST.POLICY.CONNECTIONS.MULTI_CONNECTIONS_MAPPING[CONST.POLICY.CONNECTIONS.NAME.NSQS]),
                    )
                }
            />
            <View style={[styles.flexGrow1, styles.ph5, styles.pt3]}>
                <FormProvider
                    formID={ONYXKEYS.FORMS.NSQS_OAUTH2_FORM}
                    style={styles.flexGrow1}
                    validate={validate}
                    onSubmit={connectPolicy}
                    submitButtonText={translate('workspace.accounting.setup')}
                    enabledWhenOffline
                    shouldValidateOnBlur
                    shouldValidateOnChange
                >
                    <Text style={[styles.textHeadlineH1, styles.mb5]}>{translate('workspace.nsqs.setup.description')}</Text>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.NSQS_ACCOUNT_ID}
                        ref={inputCallbackRef}
                        label={translate('workspace.nsqs.setup.formInputs.netSuiteAccountID')}
                        aria-label={translate('workspace.nsqs.setup.formInputs.netSuiteAccountID')}
                        role={CONST.ROLE.PRESENTATION}
                        spellCheck={false}
                    />
                </FormProvider>
            </View>
        </ScreenWrapper>
    );
}

NSQSSetupPage.displayName = 'NSQSSetupPage';

export default withPolicyConnections(NSQSSetupPage);
