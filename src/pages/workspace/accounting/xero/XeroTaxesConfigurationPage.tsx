import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Xero from '@libs/actions/connections/Xero';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';

function XeroTaxesConfigurationPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const xeroConfig = policy?.connections?.xero?.config;
    const isSwitchOn = !!xeroConfig?.importTaxRates;

    return (
        <ConnectionLayout
            displayName={XeroTaxesConfigurationPage.displayName}
            headerTitle="workspace.accounting.taxes"
            title="workspace.xero.taxesDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
        >
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.import')}
                switchAccessibilityLabel={translate('workspace.xero.customers')}
                isActive={isSwitchOn}
                onToggle={() => Xero.updateXeroImportTaxRates(policyID, !xeroConfig?.importTaxRates, xeroConfig?.importTaxRates)}
                errors={ErrorUtils.getLatestErrorField(xeroConfig ?? {}, CONST.XERO_CONFIG.IMPORT_TAX_RATES)}
                onCloseError={() => Policy.clearXeroErrorField(policyID, CONST.XERO_CONFIG.IMPORT_TAX_RATES)}
                pendingAction={PolicyUtils.settingsPendingAction([CONST.XERO_CONFIG.IMPORT_TAX_RATES], xeroConfig?.pendingFields)}
            />
        </ConnectionLayout>
    );
}

XeroTaxesConfigurationPage.displayName = 'XeroTaxesConfigurationPage';

export default withPolicyConnections(XeroTaxesConfigurationPage);
