import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SettingsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type ReconciliationAccountSettingsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.RECONCILIATION_ACCOUNT_SETTINGS>;

function ReconciliationAccountSettingsPage({route}: ReconciliationAccountSettingsPageProps) {
    const policyID = route.params.policyID;
    const styles = useThemeStyles();

    return (
        <ConnectionLayout
            displayName={ReconciliationAccountSettingsPage.displayName}
            headerTitle="workspace.accounting.advanced"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
        >
            <Text>WIP</Text>
        </ConnectionLayout>
    );
}

ReconciliationAccountSettingsPage.displayName = 'PolicyAccountingPage';

export default ReconciliationAccountSettingsPage;
