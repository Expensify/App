import React, {useRef} from 'react';
import type {ComponentType, ForwardedRef} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import type {InteractiveStepSubHeaderHandle} from '@components/InteractiveStepSubHeader';
import usePermissions from '@hooks/usePermissions';
import useSubStep from '@hooks/useSubStep';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getRouteParamForConnection} from '@libs/AccountingUtils';
import {isAuthenticationError} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import NetSuiteTokenInputForm from './substeps/NetSuiteTokenInputForm';
import NetSuiteTokenSetupContent from './substeps/NetSuiteTokenSetupContent';

type SubStepWithPolicy = SubStepProps & {policyID: string};

const staticContentSteps = Array<ComponentType<SubStepWithPolicy>>(4).fill(NetSuiteTokenSetupContent);
const tokenInputSteps: Array<ComponentType<SubStepWithPolicy>> = [...staticContentSteps, NetSuiteTokenInputForm];

function NetSuiteTokenInputPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();
    const ref: ForwardedRef<InteractiveStepSubHeaderHandle> = useRef(null);
    const {canUseNSQS} = usePermissions();

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
            if (canUseNSQS) {
                const multiConnectionName = CONST.POLICY.CONNECTIONS.MULTI_CONNECTIONS_MAPPING[CONST.POLICY.CONNECTIONS.NAME.NETSUITE];
                if (!multiConnectionName) {
                    Navigation.goBack();
                    return;
                }

                Navigation.goBack(ROUTES.WORKSPACE_ACCOUNTING_MULTI_CONNECTION_SELECTOR.getRoute(policyID, getRouteParamForConnection(multiConnectionName)));
                return;
            }
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
            displayName={NetSuiteTokenInputPage.displayName}
            headerTitle="workspace.netsuite.tokenInput.title"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.flex1]}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
            onBackButtonPress={handleBackButtonPress}
            shouldIncludeSafeAreaPaddingBottom
            shouldLoadForEmptyConnection={isEmptyObject(policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.NETSUITE])}
            shouldBeBlocked={shouldPageBeBlocked}
        >
            <View style={[styles.ph5, styles.mb3, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    ref={ref}
                    startStepIndex={0}
                    stepNames={CONST.NETSUITE_CONFIG.TOKEN_INPUT_STEP_NAMES}
                />
            </View>
            <View style={[styles.flexGrow1, styles.mt3]}>
                <SubStep
                    isEditing={isEditing}
                    onNext={handleNextScreen}
                    onMove={moveTo}
                    screenIndex={screenIndex}
                    policyID={policyID}
                />
            </View>
        </ConnectionLayout>
    );
}

NetSuiteTokenInputPage.displayName = 'NetSuiteTokenInputPage';

export default withPolicyConnections(NetSuiteTokenInputPage);
