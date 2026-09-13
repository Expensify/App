import ConnectionLayout from '@components/ConnectionLayout';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import * as PolicyUtils from '@libs/PolicyUtils';

import Navigation from '@navigation/Navigation';

import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

type QBDSectionType = {
    description: string;
    action: () => void;
    title?: string;
    subscribedSettings: [string];
};

function QuickbooksDesktopImportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const {mappings, pendingFields, errorFields} = policy?.connections?.quickbooksDesktop?.config ?? {};

    const sections: QBDSectionType[] = [
        {
            description: translate('workspace.accounting.accounts'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CHART_OF_ACCOUNTS.getRoute(policyID)),
            title: translate('workspace.accounting.importAsCategory'),
            subscribedSettings: [CONST.QUICKBOOKS_DESKTOP_CONFIG.ENABLE_NEW_CATEGORIES],
        },
        {
            description: translate('workspace.qbd.classes'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CLASSES.getRoute(policyID)),
            title: translate(`workspace.accounting.importTypes.${mappings?.classes ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE}`),
            subscribedSettings: [CONST.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CLASSES],
        },
        {
            description: translate('workspace.qbd.customers'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CUSTOMERS.getRoute(policyID)),
            title: translate(`workspace.accounting.importTypes.${mappings?.customers ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE}`),
            subscribedSettings: [CONST.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CUSTOMERS],
        },
        {
            description: translate('workspace.qbd.items'),
            action: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_ITEMS.getRoute(policyID)),
            subscribedSettings: [CONST.QUICKBOOKS_DESKTOP_CONFIG.IMPORT_ITEMS],
        },
    ];

    return (
        <ConnectionLayout
            displayName="QuickbooksDesktopImportPage"
            headerTitle="workspace.accounting.import"
            title="workspace.qbd.importDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING.getRoute(policyID))}
        >
            {sections.map((section) => (
                <OfflineWithFeedback
                    key={section.description}
                    pendingAction={PolicyUtils.settingsPendingAction(section.subscribedSettings, pendingFields)}
                >
                    <MenuItemField
                        name={section.description}
                        onPress={section.action}
                        value={section.title}
                    >
                        {PolicyUtils.areSettingsInErrorFields(section.subscribedSettings, errorFields) && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                    </MenuItemField>
                </OfflineWithFeedback>
            ))}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(QuickbooksDesktopImportPage);
