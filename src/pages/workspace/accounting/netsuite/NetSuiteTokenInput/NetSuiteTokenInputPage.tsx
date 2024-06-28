import ConnectionLayout from '@components/ConnectionLayout';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import React from 'react';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import useThemeStyles from '@hooks/useThemeStyles';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import { View } from 'react-native';
import useSubStep from '@hooks/useSubStep';
import type { SubStepProps } from '@hooks/useSubStep/types';
import Navigation from '@libs/Navigation/Navigation';
import NetSuiteTokenInputStaticContent from './substeps/NetSuiteTokenInputStaticContent';
import NetSuiteTokenInputForm from './substeps/NetSuiteTokenInputForm';


const staticContentSteps = Array(4).fill(NetSuiteTokenInputStaticContent);
const tokenInputSteps: Array<React.ComponentType<SubStepProps>> = [...staticContentSteps, NetSuiteTokenInputForm];

function NetSuiteTokenInputPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();

    const submit = () => {
        alert('Submit');
    };

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
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            allowWithoutConnection
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}            
            onBackButtonPress={handleBackButtonPress}
        >
            <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={screenIndex}
                    stepNames={CONST.NETSUITE_CONFIG.TOKEN_INPUT_STEP_NAMES}
                />
            </View>
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
                screenIndex={screenIndex}
            />
        </ConnectionLayout>
    );
}

NetSuiteTokenInputPage.displayName = 'NetSuiteTokenInputPage';

export default withPolicyConnections(NetSuiteTokenInputPage);
