import React, {useEffect} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as QuickbooksOnline from '@libs/actions/connections/QuickbooksOnline';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import {shouldSwitchLocationsToReportFields} from '@pages/workspace/accounting/qbo/utils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type QBOSectionType = {
    description: string;
    action: () => void;
    title: string;
    subscribedSettings: [string];
};

function QuickbooksImportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const {syncClasses, syncCustomers, syncLocations, syncTax, pendingFields, errorFields} = qboConfig ?? {};

    // If we previously selected tags but now we have the line items restriction for locations, we need to switch to report fields
    useEffect(() => {
        if (!shouldSwitchLocationsToReportFields(qboConfig)) {
            return;
        }
        QuickbooksOnline.updateQuickbooksOnlineSyncLocations(policyID, CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD, qboConfig?.syncLocations);
    }, [qboConfig, policyID]);

    const sections: QBOSectionType[] = [
        {
            description: translate('workspace.accounting.accounts'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CHART_OF_ACCOUNTS.getRoute(policyID)),
            title: translate('workspace.accounting.importAsCategory'),
            subscribedSettings: [CONST.QUICKBOOKS_CONFIG.ENABLE_NEW_CATEGORIES],
        },
        {
            description: translate('workspace.qbo.classes'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CLASSES.getRoute(policyID)),
            title: translate(`workspace.accounting.importTypes.${syncClasses ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE}`),
            subscribedSettings: [CONST.QUICKBOOKS_CONFIG.SYNC_CLASSES],
        },
        {
            description: translate('workspace.qbo.customers'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CUSTOMERS.getRoute(policyID)),
            title: translate(`workspace.accounting.importTypes.${syncCustomers ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE}`),
            subscribedSettings: [CONST.QUICKBOOKS_CONFIG.SYNC_CUSTOMERS],
        },
        {
            description: translate('workspace.qbo.locations'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_LOCATIONS.getRoute(policyID)),
            title: translate(`workspace.accounting.importTypes.${syncLocations ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE}`),
            subscribedSettings: [CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS],
        },
    ];

    if (policy?.connections?.quickbooksOnline?.data?.country !== CONST.COUNTRY.US) {
        sections.push({
            description: translate('workspace.accounting.taxes'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_TAXES.getRoute(policyID)),
            title: translate(syncTax ? 'workspace.accounting.imported' : 'workspace.accounting.notImported'),
            subscribedSettings: [CONST.QUICKBOOKS_CONFIG.SYNC_TAX],
        });
    }

    return (
        <ConnectionLayout
            displayName="QuickbooksImportPage"
            headerTitle="workspace.accounting.import"
            title="workspace.qbo.importDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
        >
            {sections.map((section) => (
                <OfflineWithFeedback
                    key={section.description}
                    pendingAction={PolicyUtils.settingsPendingAction(section.subscribedSettings, pendingFields)}
                >
                    <MenuItemWithTopDescription
                        title={section.title}
                        description={section.description}
                        shouldShowRightIcon
                        onPress={section.action}
                        brickRoadIndicator={PolicyUtils.areSettingsInErrorFields(section.subscribedSettings, errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                </OfflineWithFeedback>
            ))}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(QuickbooksImportPage);
