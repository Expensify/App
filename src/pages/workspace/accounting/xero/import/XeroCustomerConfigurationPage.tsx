import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import * as ErrorUtils from '@libs/ErrorUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';

function XeroCustomerConfigurationPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const xeroConfig = policy?.connections?.xero?.config;
    const isSwitchOn = !!xeroConfig?.importCustomers;

    return (
        <ConnectionLayout
            displayName={XeroCustomerConfigurationPage.displayName}
            headerTitle="workspace.xero.customers"
            title="workspace.xero.customersDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[[styles.pb2, styles.ph5]]}
        >
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.import')}
                switchAccessibilityLabel={translate('workspace.xero.customers')}
                subMenuItems={
                    <MenuItemWithTopDescription
                        interactive={false}
                        title={translate('workspace.common.tags')}
                        description={translate('workspace.common.displayedAs')}
                        wrapperStyle={styles.sectionMenuItemTopDescription}
                    />
                }
                isActive={isSwitchOn}
                onToggle={() => Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.XERO, CONST.XERO_CONFIG.IMPORT_CUSTOMERS, !xeroConfig?.importCustomers)}
                errors={ErrorUtils.getLatestErrorField(xeroConfig ?? {}, CONST.XERO_CONFIG.IMPORT_CUSTOMERS)}
                onCloseError={() => Policy.clearXeroErrorField(policyID, CONST.XERO_CONFIG.IMPORT_CUSTOMERS)}
            />
        </ConnectionLayout>
    );
}

XeroCustomerConfigurationPage.displayName = 'XeroCustomerConfigurationPage';

export default withPolicyConnections(XeroCustomerConfigurationPage);
