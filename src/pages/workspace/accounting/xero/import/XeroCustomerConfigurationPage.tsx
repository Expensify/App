import React from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function XeroCustomerConfigurationPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {importCustomers, pendingFields} = policy?.connections?.xero?.config ?? {};

    const isSwitchOn = Boolean(importCustomers);

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
            <View>
                <View style={[styles.flexRow, styles.mb4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <View style={styles.flex1}>
                        <Text fontSize={variables.fontSizeNormal}>{translate('workspace.accounting.import')}</Text>
                    </View>
                    <OfflineWithFeedback pendingAction={pendingFields?.importCustomers}>
                        <View style={[styles.flex1, styles.alignItemsEnd, styles.pl3]}>
                            <Switch
                                accessibilityLabel={translate('workspace.xero.customers')}
                                isOn={isSwitchOn}
                                onToggle={() => Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.XERO, CONST.XERO_CONFIG.IMPORT_CUSTOMERS, !importCustomers)}
                            />
                        </View>
                    </OfflineWithFeedback>
                </View>
                {isSwitchOn && (
                    <OfflineWithFeedback pendingAction={pendingFields?.importCustomers}>
                        <MenuItemWithTopDescription
                            interactive={false}
                            title={translate('workspace.common.tags')}
                            description={translate('workspace.common.displayedAs')}
                            wrapperStyle={styles.sectionMenuItemTopDescription}
                        />
                    </OfflineWithFeedback>
                )}
            </View>
        </ConnectionLayout>
    );
}

XeroCustomerConfigurationPage.displayName = 'XeroCustomerConfigurationPage';

export default withPolicyConnections(XeroCustomerConfigurationPage);
