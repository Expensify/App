import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import * as ErrorUtils from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearQBOErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';

function QuickbooksTaxesPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const {syncTax, reimbursableExpensesExportDestination, pendingFields} = qboConfig ?? {};
    const isJournalExportEntity = reimbursableExpensesExportDestination === CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY;
    return (
        <ConnectionLayout
            displayName={QuickbooksTaxesPage.displayName}
            headerTitle="workspace.accounting.taxes"
            title="workspace.qbo.taxesDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[[styles.pb2, styles.ph5]]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
        >
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.import')}
                switchAccessibilityLabel={translate('workspace.accounting.taxes')}
                isActive={!!syncTax}
                onToggle={() => Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.QUICKBOOKS_CONFIG.SYNC_TAX, !syncTax)}
                pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.SYNC_TAX], pendingFields)}
                errors={ErrorUtils.getLatestErrorField(qboConfig ?? {}, CONST.QUICKBOOKS_CONFIG.SYNC_TAX)}
                onCloseError={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.SYNC_TAX)}
            />
            {!syncTax && isJournalExportEntity && <Text style={[styles.mutedNormalTextLabel, styles.pt2]}>{translate('workspace.qbo.taxesJournalEntrySwitchNote')}</Text>}
        </ConnectionLayout>
    );
}

QuickbooksTaxesPage.displayName = 'QuickbooksTaxesPage';

export default withPolicyConnections(QuickbooksTaxesPage);
