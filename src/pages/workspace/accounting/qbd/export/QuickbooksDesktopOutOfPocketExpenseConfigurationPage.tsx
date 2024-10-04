import React, {useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

type QBDSectionType = {
    title?: string;
    description?: string;
    onPress: () => void;
    errorText?: string;
    hintText?: string;
    subscribedSettings: string[];
    pendingAction?: PendingAction;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
};
const account = [CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT];
const accountOrExportDestination = [CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, CONST.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT];

function QuickbooksDesktopOutOfPocketExpenseConfigurationPage({policy}: WithPolicyConnectionsProps) {
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

    const sections: QBDSectionType[] = [
        {
            title: qboConfig?.reimbursableExpensesExportDestination ? translate(`workspace.qbo.accounts.${qboConfig?.reimbursableExpensesExportDestination}`) : undefined,
            description: translate('workspace.accounting.exportAs'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT.getRoute(policyID)),
            hintText: exportHintText,
            subscribedSettings: accountOrExportDestination,
            pendingAction: PolicyUtils.settingsPendingAction(accountOrExportDestination, qboConfig?.pendingFields),
            brickRoadIndicator: PolicyUtils.areSettingsInErrorFields(accountOrExportDestination, qboConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        },
        {
            title: qboConfig?.reimbursableExpensesAccount?.name ?? translate('workspace.qbo.notConfigured'),
            description: accountDescription,
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT.getRoute(policyID)),
            subscribedSettings: account,
            pendingAction: PolicyUtils.settingsPendingAction(account, qboConfig?.pendingFields),
            brickRoadIndicator: PolicyUtils.areSettingsInErrorFields(account, qboConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        },
    ];

    const toggleSettingItems = [
        ...(qboConfig?.reimbursableExpensesExportDestination === CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK
            ? [
                  {
                      title: translate('workspace.qbd.exportOutOfPocketExpensesCheckToogle'),
                      switchAccessibilityLabel: translate('workspace.qbd.exportOutOfPocketExpensesCheckToogle'),
                      isActive: !!qboConfig?.autoSync?.enabled,
                      onToggle: () => {},
                      subscribedSetting: CONST.QUICKBOOKS_CONFIG.AUTO_SYNC,
                      errors: {},
                  },
              ]
            : []),
    ];

    return (
        <ConnectionLayout
            displayName={QuickbooksDesktopOutOfPocketExpenseConfigurationPage.displayName}
            headerTitle="workspace.accounting.exportOutOfPocket"
            title="workspace.qbd.exportOutOfPocketExpensesDescription"
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
                    pendingAction={section.pendingAction}
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                >
                    <MenuItemWithTopDescription
                        title={section.title}
                        description={section.description}
                        onPress={section.onPress}
                        shouldShowRightIcon
                        brickRoadIndicator={section.brickRoadIndicator}
                        hintText={section.hintText}
                    />
                </OfflineWithFeedback>
            ))}
            {toggleSettingItems.map((item) => (
                <ToggleSettingOptionRow
                    key={item.title}
                    title={item.title}
                    switchAccessibilityLabel={item.switchAccessibilityLabel}
                    shouldPlaceSubtitleBelowSwitch
                    wrapperStyle={[styles.mv3, styles.ph5]}
                    isActive={item.isActive}
                    onToggle={item.onToggle}
                    errors={item.errors}
                />
            ))}
        </ConnectionLayout>
    );
}

QuickbooksDesktopOutOfPocketExpenseConfigurationPage.displayName = 'QuickbooksDesktopOutOfPocketExpenseConfigurationPage';

export default withPolicyConnections(QuickbooksDesktopOutOfPocketExpenseConfigurationPage);
