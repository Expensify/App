import React, {useRef} from 'react';
import type {ComponentType, ForwardedRef} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import type {InteractiveStepSubHeaderHandle} from '@components/InteractiveStepSubHeader';
import useSubStep from '@hooks/useSubStep';
import useThemeStyles from '@hooks/useThemeStyles';
import {isAuthenticationError} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import type {SubStepWithPolicy} from '@pages/workspace/accounting/netsuite/types';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import NetSuiteTokenInputForm from './substeps/NetSuiteTokenInputForm';
import NetSuiteTokenSetupContent from './substeps/NetSuiteTokenSetupContent';

const staticContentSteps = Array<ComponentType<SubStepWithPolicy>>(4).fill(NetSuiteTokenSetupContent);
const tokenInputSteps: Array<ComponentType<SubStepWithPolicy>> = [...staticContentSteps, NetSuiteTokenInputForm];

function NetSuiteTokenInputPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id;
    const styles = useThemeStyles();
    const ref: ForwardedRef<InteractiveStepSubHeaderHandle> = useRef(null);

    const submit = () => {
        Navigation.dismissModal();
    };

    const {
        componentToRender: SubStep,
        isEditing,
        nextScreen,
        prevScreen,
        screenIndex,
        moveTo,
    } = useSubStep<SubStepWithPolicy>({bodyContent: tokenInputSteps, startFrom: 0, onFinished: submit});

    const handleBackButtonPress = () => {
        if (screenIndex === 0) {
            Navigation.goBack();
            return;
        }
        ref.current?.movePrevious();
        prevScreen();
    };

    const handleNextScreen = () => {
        ref.current?.moveNext();
        nextScreen();
    };

    const shouldPageBeBlocked = !isEmptyObject(policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.NETSUITE]) && !isAuthenticationError(policy, CONST.POLICY.CONNECTIONS.NAME.NETSUITE);

    return (
        <ConnectionLayout
            displayName="NetSuiteTokenInputPage"
            headerTitle="workspace.netsuite.tokenInput.title"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            onBackButtonPress={handleBackButtonPress}
            shouldLoadForEmptyConnection={isEmptyObject(policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.NETSUITE])}
            shouldBeBlocked={shouldPageBeBlocked}
            shouldUseScrollView={SubStep !== NetSuiteTokenInputForm}
        >
            <View style={[styles.ph5, styles.mb3, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    ref={ref}
                    startStepIndex={screenIndex}
                    stepNames={CONST.NETSUITE_CONFIG.TOKEN_INPUT_STEP_NAMES}
                />
            </View>
            <SubStep
                isEditing={isEditing}
                onNext={handleNextScreen}
                onMove={moveTo}
                screenIndex={screenIndex}
                policyID={policyID}
            />
        </ConnectionLayout>
    );
}

export default withPolicyConnections(NetSuiteTokenInputPage);
