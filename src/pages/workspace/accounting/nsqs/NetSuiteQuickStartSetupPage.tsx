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
import INPUT_IDS from '@src/types/form/NetSuiteQuickStartOAuth2Form';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function NetSuiteQuickStartSetupPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const shouldPageBeBlocked = !isEmptyObject(policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.NSQS]) && !isAuthenticationError(policy, CONST.POLICY.CONNECTIONS.NAME.NSQS);

    return (
        <ConnectionLayout
            displayName={NetSuiteQuickStartSetupPage.displayName}
            headerTitle="workspace.netsuite.tokenInput.title"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NSQS}
            onBackButtonPress={() => Navigation.goBack()}
            shouldIncludeSafeAreaPaddingBottom
            shouldLoadForEmptyConnection={isEmptyObject(policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.NSQS])}
            shouldBeBlocked={shouldPageBeBlocked}
        >
            <View style={[styles.flexGrow1, styles.ph5]}>
                <FormProvider
                    formID={ONYXKEYS.FORMS.NSQS_OAUTH2_FORM}
                    style={styles.flexGrow1}
                    // validate={() => null}
                    onSubmit={() => null}
                    submitButtonText={translate('common.continue')} // s77rt: use connect
                    shouldValidateOnBlur
                    shouldValidateOnChange
                >
                    <Text style={[styles.textHeadlineH1, styles.pb5, styles.pt3]}>{'Enter your NetSuite account ID'}</Text> {/* s77rt translate */}
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.NSQS_ACCOUNT_ID}
                        ref={inputCallbackRef}
                        label={'ID please'} // s77rt
                        aria-label={'ID please'} // s77rt
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
