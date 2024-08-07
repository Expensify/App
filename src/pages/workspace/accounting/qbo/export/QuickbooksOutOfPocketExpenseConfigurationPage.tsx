import React, {useMemo} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type QBOSectionType = {
    title?: string;
    description?: string;
    onPress: () => void;
    errorText?: string;
    hintText?: string;
    subscribedSettings: string[];
};

function QuickbooksOutOfPocketExpenseConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const isLocationEnabled = !!(qboConfig?.syncLocations && qboConfig?.syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    const isTaxesEnabled = !!qboConfig?.syncTax;
    const [exportHintText, accountDescription] = useMemo(() => {
        let hintText: string | undefined;
        let description: string | undefined;
        switch (qboConfig?.reimbursableExpensesExportDestination) {
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
                hintText = isLocationEnabled ? undefined : translate('workspace.qbo.exportCheckDescription');
                description = translate('workspace.qbo.bankAccount');
                break;
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
                hintText = isTaxesEnabled ? undefined : translate('workspace.qbo.exportJournalEntryDescription');
                description = translate('workspace.qbo.account');
                break;
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                hintText = isLocationEnabled ? undefined : translate('workspace.qbo.exportVendorBillDescription');
                description = translate('workspace.qbo.accountsPayable');
                break;
            default:
                break;
        }

        return [hintText, description];
    }, [translate, qboConfig?.reimbursableExpensesExportDestination, isLocationEnabled, isTaxesEnabled]);

    const sections: QBOSectionType[] = [
        {
            title: qboConfig?.reimbursableExpensesExportDestination ? translate(`workspace.qbo.accounts.${qboConfig?.reimbursableExpensesExportDestination}`) : undefined,
            description: translate('workspace.accounting.exportAs'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT.getRoute(policyID)),
            hintText: exportHintText,
            subscribedSettings: [CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT],
        },
        {
            title: qboConfig?.reimbursableExpensesAccount?.name ?? translate('workspace.qbo.notConfigured'),
            description: accountDescription,
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT.getRoute(policyID)),
            subscribedSettings: [CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT],
        },
    ];

    return (
        <ConnectionLayout
            displayName={QuickbooksOutOfPocketExpenseConfigurationPage.displayName}
            headerTitle="workspace.accounting.exportOutOfPocket"
            title="workspace.qbo.exportOutOfPocketExpensesDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID))}
        >
            {sections.map((section, index) => (
                <OfflineWithFeedback
                    pendingAction={PolicyUtils.settingsPendingAction(section.subscribedSettings, qboConfig?.pendingFields)}
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                >
                    <MenuItemWithTopDescription
                        title={section.title}
                        description={section.description}
                        onPress={section.onPress}
                        shouldShowRightIcon
                        brickRoadIndicator={PolicyUtils.areSettingsInErrorFields(section.subscribedSettings, qboConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        hintText={section.hintText}
                    />
                </OfflineWithFeedback>
            ))}
        </ConnectionLayout>
    );
}

QuickbooksOutOfPocketExpenseConfigurationPage.displayName = 'QuickbooksExportOutOfPocketExpensesPage';

export default withPolicyConnections(QuickbooksOutOfPocketExpenseConfigurationPage);
