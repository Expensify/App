import ConnectionLayout from '@components/ConnectionLayout';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import React, {useCallback} from 'react';
import * as FormActions from '@userActions/FormActions';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import useThemeStyles from '@hooks/useThemeStyles';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import {View} from 'react-native';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import {useOnyx} from 'react-native-onyx';
import {connectPolicyToNetSuite} from '@libs/actions/connections/NetSuiteCommands';
import ROUTES from '@src/ROUTES';
import NetSuiteTokenSetupContent from './substeps/NetSuiteTokenSetupContent';
import NetSuiteTokenInputForm from './substeps/NetSuiteTokenInputForm';

const staticContentSteps = Array(4).fill(NetSuiteTokenSetupContent);
const tokenInputSteps: Array<React.ComponentType<SubStepProps>> = [...staticContentSteps, NetSuiteTokenInputForm];

function NetSuiteTokenInputPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();

    const [netsuiteTokenInputValues] = useOnyx(ONYXKEYS.FORMS.NETSUITE_TOKEN_INPUT_FORM_DRAFT);

    const submit = useCallback(() => {
        connectPolicyToNetSuite(policyID, {
            accountID: netsuiteTokenInputValues?.accountID ?? '',
            tokenID: netsuiteTokenInputValues?.tokenID ?? '',
            tokenSecret: netsuiteTokenInputValues?.tokenSecret ?? ''
        });
        FormActions.clearDraftValues(ONYXKEYS.FORMS.NETSUITE_TOKEN_INPUT_FORM);
        Navigation.goBack(ROUTES.POLICY_ACCOUNTING.getRoute(policyID));;
    }, [policyID, netsuiteTokenInputValues]);

    const {componentToRender: SubStep, isEditing, nextScreen, prevScreen, screenIndex, moveTo} = useSubStep({bodyContent: tokenInputSteps, startFrom: 0, onFinished: submit});

    const handleBackButtonPress = () => {
        if (screenIndex === 0) {
            Navigation.goBack();
            return;
        }
        prevScreen();
    };

    return (
        <ConnectionLayout
            displayName={NetSuiteTokenInputPage.displayName}
            headerTitle="workspace.netsuite.tokenInput.title"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1]}
            titleStyle={styles.ph5}
            allowWithoutConnection
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
            onBackButtonPress={handleBackButtonPress}
        >
            <View style={[styles.ph5, styles.mb3, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={screenIndex}
                    stepNames={CONST.NETSUITE_CONFIG.TOKEN_INPUT_STEP_NAMES}
                />
            </View>
            <View style={[styles.flexGrow1, styles.mt3]}>
                <SubStep
                    isEditing={isEditing}
                    onNext={nextScreen}
                    onMove={moveTo}
                    screenIndex={screenIndex}
                />
            </View>
        </ConnectionLayout>
    );
}

NetSuiteTokenInputPage.displayName = 'NetSuiteTokenInputPage';

export default withPolicyConnections(NetSuiteTokenInputPage);
