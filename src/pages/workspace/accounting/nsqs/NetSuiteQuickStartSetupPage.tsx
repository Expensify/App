import React, {useRef} from 'react';
import type {ComponentType, ForwardedRef} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import type {InteractiveStepSubHeaderHandle} from '@components/InteractiveStepSubHeader';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {isAuthenticationError} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/NetSuiteQuickStartOAuth2Form';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function NetSuiteQuickStartSetupPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const shouldPageBeBlocked = !isEmptyObject(policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.NSQS]) && !isAuthenticationError(policy, CONST.POLICY.CONNECTIONS.NAME.NSQS);
    return (
        // s77rt: do not use ConnectionLayout here. Just a regular ScreenWrapper
        <ConnectionLayout
            displayName={NetSuiteQuickStartSetupPage.displayName}
            headerTitle="workspace.nsqs.setup.title"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NSQS}
            onBackButtonPress={() =>
                Navigation.goBack(
                    ROUTES.WORKSPACE_ACCOUNTING_MULTI_CONNECTION_SELECTOR.getRoute(policyID, CONST.POLICY.CONNECTIONS.MULTI_CONNECTIONS_MAPPING[CONST.POLICY.CONNECTIONS.NAME.NSQS]),
                )
            }
            shouldIncludeSafeAreaPaddingBottom
            shouldLoadForEmptyConnection={isEmptyObject(policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.NSQS])}
            shouldBeBlocked={shouldPageBeBlocked}
        >
            <View style={[styles.flexGrow1, styles.ph5, styles.pt3]}>
                <FormProvider
                    formID={ONYXKEYS.FORMS.NSQS_OAUTH2_FORM}
                    style={styles.flexGrow1}
                    // validate={() => null}
                    onSubmit={() => null}
                    submitButtonText={translate('workspace.accounting.setup')}
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
        </ConnectionLayout>
    );
}

NetSuiteQuickStartSetupPage.displayName = 'NetSuiteQuickStartSetupPage';

export default withPolicyConnections(NetSuiteQuickStartSetupPage);
