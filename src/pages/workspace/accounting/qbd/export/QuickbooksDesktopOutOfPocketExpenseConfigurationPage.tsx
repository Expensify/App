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
import {getQBDReimbursableAccounts} from '@pages/workspace/accounting/utils';
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
const account = [CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT];
const accountOrExportDestination = [CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE, CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT];
const markChecksToBePrintedOrExportDestination = [CONST.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE, CONST.QUICKBOOKS_DESKTOP_CONFIG.MARK_CHECKS_TO_BE_PRINTED];

function QuickbooksDesktopOutOfPocketExpenseConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const reimbursable = qbdConfig?.export.reimbursable;
    const {canUseNewDotQBD} = usePermissions();
    const [exportHintText, accountDescription, accountsList] = useMemo(() => {
        let hintText: string | undefined;
        let description: string | undefined;
        const accounts = getQBDReimbursableAccounts(policy?.connections?.quickbooksDesktop);
        switch (reimbursable) {
            case CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
                hintText = translate('workspace.qbd.exportCheckDescription');
                description = translate('workspace.qbd.bankAccount');
                break;
            case CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
                hintText = translate('workspace.qbd.exportJournalEntryDescription');
                description = translate('workspace.qbd.account');
                break;
            case CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                hintText = translate('workspace.qbd.exportVendorBillDescription');
                description = translate('workspace.qbd.accountsPayable');
                break;
            default:
                break;
        }

        return [hintText, description, accounts];
    }, [policy?.connections?.quickbooksDesktop, reimbursable, translate]);

    const sections: QBDSectionType[] = [
        {
            title: reimbursable ? translate(`workspace.qbd.accounts.${reimbursable}`) : undefined,
            description: translate('workspace.accounting.exportAs'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT.getRoute(policyID)),
            hintText: exportHintText,
            subscribedSettings: accountOrExportDestination,
            pendingAction: PolicyUtils.settingsPendingAction(accountOrExportDestination, qbdConfig?.pendingFields),
            brickRoadIndicator: PolicyUtils.areSettingsInErrorFields(accountOrExportDestination, qbdConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        },
        {
            title: accountsList.find(({id}) => qbdConfig?.export.reimbursableAccount === id)?.name ?? translate('workspace.qbd.notConfigured'),
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
            shouldBeBlocked={!canUseNewDotQBD} // TODO: [QBD] remove it once the QBD beta is done
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
            {reimbursable === CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK && (
                <ToggleSettingOptionRow
                    key={translate('workspace.qbd.exportOutOfPocketExpensesCheckToogle')}
                    title={translate('workspace.qbd.exportOutOfPocketExpensesCheckToogle')}
                    switchAccessibilityLabel={translate('workspace.qbd.exportOutOfPocketExpensesCheckToogle')}
                    shouldPlaceSubtitleBelowSwitch
                    wrapperStyle={[styles.mv3, styles.ph5]}
                    isActive={!!qbdConfig?.markChecksToBePrinted}
                    onToggle={() => QuickbooksDesktop.updateQuickbooksDesktopMarkChecksToBePrinted(policyID, !qbdConfig?.markChecksToBePrinted)}
                    errors={ErrorUtils.getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.MARK_CHECKS_TO_BE_PRINTED)}
                    pendingAction={settingsPendingAction(markChecksToBePrintedOrExportDestination, qbdConfig?.pendingFields)}
                    onCloseError={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.MARK_CHECKS_TO_BE_PRINTED)}
                />
            )}
        </ConnectionLayout>
    );
}

QuickbooksDesktopOutOfPocketExpenseConfigurationPage.displayName = 'QuickbooksDesktopOutOfPocketExpenseConfigurationPage';

export default withPolicyConnections(QuickbooksDesktopOutOfPocketExpenseConfigurationPage);
