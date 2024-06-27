import ConnectionLayout from '@components/ConnectionLayout';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import React from 'react';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from '@components/Text';

function NetSuiteTokenInputPage({policy}: WithPolicyConnectionsProps) {
    const policyID = policy?.id ?? '-1';
    const styles = useThemeStyles();

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
        >
            <Text>Test</Text>
        </ConnectionLayout>
    );
}

NetSuiteTokenInputPage.displayName = 'NetSuiteTokenInputPage';

export default withPolicyConnections(NetSuiteTokenInputPage);
