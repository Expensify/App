import React from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import variables from '@styles/variables';
import {updateXeroEnableNewCategories} from '@userActions/connections/Xero';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';

function XeroChartOfAccountsPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const xeroConfig = policy?.connections?.xero?.config;

    return (
        <ConnectionLayout
            displayName={XeroChartOfAccountsPage.displayName}
            headerTitle="workspace.accounting.accounts"
            title="workspace.xero.accountsDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.XERO}
        >
            <View style={[styles.flexRow, styles.mb4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                <View style={styles.flex1}>
                    <Text fontSize={variables.fontSizeNormal}>{translate('workspace.accounting.import')}</Text>
                </View>
                <View style={[styles.flex1, styles.alignItemsEnd, styles.pl3]}>
                    <Switch
                        accessibilityLabel={translate('workspace.accounting.accounts')}
                        isOn
                        disabled
                        onToggle={() => {}}
                    />
                </View>
            </View>
            <MenuItemWithTopDescription
                interactive={false}
                title={translate('workspace.common.categories')}
                description={translate('workspace.common.displayedAs')}
                wrapperStyle={styles.sectionMenuItemTopDescription}
            />
            <Text style={styles.pv5}>{translate('workspace.xero.accountsSwitchTitle')}</Text>
            <ToggleSettingOptionRow
                title={translate('workspace.common.enabled')}
                subtitle={translate('workspace.xero.accountsSwitchDescription')}
                switchAccessibilityLabel={translate('workspace.xero.accountsSwitchDescription')}
                shouldPlaceSubtitleBelowSwitch
                isActive={!!xeroConfig?.enableNewCategories}
                onToggle={() => updateXeroEnableNewCategories(policyID, !xeroConfig?.enableNewCategories, xeroConfig?.enableNewCategories)}
                pendingAction={settingsPendingAction([CONST.XERO_CONFIG.ENABLE_NEW_CATEGORIES], xeroConfig?.pendingFields)}
                errors={ErrorUtils.getLatestErrorField(xeroConfig ?? {}, CONST.XERO_CONFIG.ENABLE_NEW_CATEGORIES)}
                onCloseError={() => Policy.clearXeroErrorField(policyID, CONST.XERO_CONFIG.ENABLE_NEW_CATEGORIES)}
            />
        </ConnectionLayout>
    );
}

XeroChartOfAccountsPage.displayName = 'XeroChartOfAccountsPage';

export default withPolicyConnections(XeroChartOfAccountsPage);
