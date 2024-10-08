import React, {useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import * as QuickbooksDesktop from '@libs/actions/connections/QuickbooksDesktop';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import {settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearQBDErrorField} from '@userActions/Policy/Policy';
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
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const isLocationEnabled = !!(qbdConfig?.syncLocations && qbdConfig?.syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    const isTaxesEnabled = !!qbdConfig?.syncTax;
    const {canUseNewDotQBD} = usePermissions();
    const [exportHintText, accountDescription] = useMemo(() => {
        let hintText: string | undefined;
        let description: string | undefined;
        switch (qbdConfig?.reimbursableExpensesExportDestination) {
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
                hintText = isLocationEnabled ? undefined : translate('workspace.qbd.exportCheckDescription');
                description = translate('workspace.qbd.bankAccount');
                break;
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
                hintText = isTaxesEnabled ? undefined : translate('workspace.qbd.exportJournalEntryDescription');
                description = translate('workspace.qbd.account');
                break;
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                hintText = isLocationEnabled ? undefined : translate('workspace.qbd.exportVendorBillDescription');
                description = translate('workspace.qbd.accountsPayable');
                break;
            default:
                break;
        }

        return [hintText, description];
    }, [translate, qbdConfig?.reimbursableExpensesExportDestination, isLocationEnabled, isTaxesEnabled]);

    const sections: QBDSectionType[] = [
        {
            title: qbdConfig?.reimbursableExpensesExportDestination ? translate(`workspace.qbd.accounts.${qbdConfig?.reimbursableExpensesExportDestination}`) : undefined,
            description: translate('workspace.accounting.exportAs'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT.getRoute(policyID)),
            hintText: exportHintText,
            subscribedSettings: accountOrExportDestination,
            pendingAction: PolicyUtils.settingsPendingAction(accountOrExportDestination, qbdConfig?.pendingFields),
            brickRoadIndicator: PolicyUtils.areSettingsInErrorFields(accountOrExportDestination, qbdConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        },
        {
            title: qbdConfig?.reimbursableExpensesAccount?.name ?? translate('workspace.qbd.notConfigured'),
            description: accountDescription,
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT.getRoute(policyID)),
            subscribedSettings: account,
            pendingAction: PolicyUtils.settingsPendingAction(account, qbdConfig?.pendingFields),
            brickRoadIndicator: PolicyUtils.areSettingsInErrorFields(account, qbdConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        },
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
            shouldBeBlocked={!canUseNewDotQBD} // TODO: remove it once the QBD beta is done
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT.getRoute(policyID))}
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
            {qbdConfig?.reimbursableExpensesExportDestination === CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK && (
                <ToggleSettingOptionRow
                    key={translate('workspace.qbd.exportOutOfPocketExpensesCheckToogle')}
                    title={translate('workspace.qbd.exportOutOfPocketExpensesCheckToogle')}
                    switchAccessibilityLabel={translate('workspace.qbd.exportOutOfPocketExpensesCheckToogle')}
                    shouldPlaceSubtitleBelowSwitch
                    wrapperStyle={[styles.mv3, styles.ph5]}
                    isActive={!!qbdConfig?.markChecksToBePrinted}
                    onToggle={() => QuickbooksDesktop.updateQuickbooksDesktopMarkChecksToBePrinted(policyID, !qbdConfig?.markChecksToBePrinted)}
                    errors={ErrorUtils.getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.MARK_CHECKS_TO_BE_PRINTED)}
                    pendingAction={settingsPendingAction([CONST.QUICKBOOKS_DESKTOP_CONFIG.MARK_CHECKS_TO_BE_PRINTED], qbdConfig?.pendingFields)}
                    onCloseError={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.MARK_CHECKS_TO_BE_PRINTED)}
                />
            )}
        </ConnectionLayout>
    );
}

QuickbooksDesktopOutOfPocketExpenseConfigurationPage.displayName = 'QuickbooksDesktopOutOfPocketExpenseConfigurationPage';

export default withPolicyConnections(QuickbooksDesktopOutOfPocketExpenseConfigurationPage);
