import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import MenuItemSectionRow from '@components/MenuItem/presets/MenuItemSectionRow';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import * as ErrorUtils from '@libs/ErrorUtils';
import * as PolicyUtils from '@libs/PolicyUtils';

import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {updateXeroImportCustomers} from '@userActions/connections/Xero';
import * as Policy from '@userActions/Policy/Policy';

import CONST from '@src/CONST';

import React from 'react';

function XeroCustomerConfigurationPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const xeroConfig = policy?.connections?.xero?.config;
    const isSwitchOn = !!xeroConfig?.importCustomers;

    return (
        <ConnectionLayout
            displayName="XeroCustomerConfigurationPage"
            headerTitle="workspace.xero.customers"
            title="workspace.xero.customersDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[[styles.pb2, styles.ph5]]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
        >
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.import')}
                switchAccessibilityLabel={translate('workspace.xero.customers')}
                accordionStyle={styles.overflowHidden}
                subMenuItems={
                    <MenuItemSectionRow>
                        <MenuItemField.Row
                            name={translate('workspace.common.displayedAs')}
                            value={translate('workspace.common.tags')}
                        />
                    </MenuItemSectionRow>
                }
                isActive={isSwitchOn}
                onToggle={() => updateXeroImportCustomers(policyID, !xeroConfig?.importCustomers, xeroConfig?.importCustomers)}
                errors={ErrorUtils.getLatestErrorField(xeroConfig ?? {}, CONST.XERO_CONFIG.IMPORT_CUSTOMERS)}
                onCloseError={() => Policy.clearXeroErrorField(policyID, CONST.XERO_CONFIG.IMPORT_CUSTOMERS)}
                pendingAction={PolicyUtils.settingsPendingAction([CONST.XERO_CONFIG.IMPORT_CUSTOMERS], xeroConfig?.pendingFields)}
            />
        </ConnectionLayout>
    );
}

export default withPolicyConnections(XeroCustomerConfigurationPage);
