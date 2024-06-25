import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import CONST from '@src/CONST';

function SageIntacctUserDimensionsPage({policy}: WithPolicyProps) {
    const styles = useThemeStyles();

    const policyID = policy?.id ?? '-1';

    return (
        <ConnectionLayout
            displayName={SageIntacctUserDimensionsPage.displayName}
            headerTitle="workspace.accounting.import"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
        >
            <Text style={[styles.ph5, styles.pb5]}>SageIntacctUserDimensionsPage</Text>
        </ConnectionLayout>
    );
}

SageIntacctUserDimensionsPage.displayName = 'PolicySageIntacctUserDimensionsPage';

export default withPolicy(SageIntacctUserDimensionsPage);
