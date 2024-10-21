import React, {useMemo} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import * as QuickbooksDesktop from '@libs/actions/connections/QuickbooksDesktop';
import * as ConnectionUtils from '@libs/ConnectionUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import {getQBDReimbursableAccounts} from '@pages/workspace/accounting/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearQBDErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksDesktopCompanyCardExpenseAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const qbdConfig = policy?.connections?.quickbooksDesktop?.config;
    const {vendors} = policy?.connections?.quickbooksDesktop?.data ?? {};
    const nonReimbursableBillDefaultVendorObject = vendors?.find((vendor) => vendor.id === qbdConfig?.export?.nonReimbursableBillDefaultVendor);
    const {canUseNewDotQBD} = usePermissions();
    const nonReimbursable = qbdConfig?.export?.nonReimbursable;
    const nonReimbursableAccount = qbdConfig?.export?.nonReimbursableAccount;

    const accountName = useMemo(
        () => getQBDReimbursableAccounts(policy?.connections?.quickbooksDesktop, nonReimbursable).find(({id}) => nonReimbursableAccount === id)?.name,
        [policy?.connections?.quickbooksDesktop, nonReimbursable, nonReimbursableAccount],
    );

    const sections = [
        {
            title: nonReimbursable ? translate(`workspace.qbd.accounts.${nonReimbursable}`) : undefined,
            description: translate('workspace.accounting.exportAs'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_SELECT.getRoute(policyID)),
            hintText: nonReimbursable ? translate(`workspace.qbd.accounts.${nonReimbursable}Description`) : undefined,
            subscribedSettings: [CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE],
            keyForList: translate('workspace.accounting.exportAs'),
        },
        {
            title: accountName ?? translate('workspace.qbd.notConfigured'),
            description: ConnectionUtils.getQBDNonReimbursableExportAccountType(nonReimbursable),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT.getRoute(policyID)),
            subscribedSettings: [CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT],
            keyForList: ConnectionUtils.getQBDNonReimbursableExportAccountType(nonReimbursable),
        },
    ];

    return (
        <ConnectionLayout
            policyID={policyID}
            displayName={QuickbooksDesktopCompanyCardExpenseAccountPage.displayName}
            headerTitle="workspace.accounting.exportCompanyCard"
            title="workspace.qbd.exportCompanyCardsDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            shouldBeBlocked={!canUseNewDotQBD} // TODO: [QBD] remove it once the QBD beta is done
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBD}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT.getRoute(policyID))}
        >
            {sections.map((section) => (
                <OfflineWithFeedback
                    key={section.keyForList}
                    pendingAction={PolicyUtils.settingsPendingAction(section.subscribedSettings, qbdConfig?.pendingFields)}
                >
                    <MenuItemWithTopDescription
                        title={section.title}
                        description={section.description}
                        onPress={section.onPress}
                        brickRoadIndicator={PolicyUtils.areSettingsInErrorFields(section.subscribedSettings, qbdConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        shouldShowRightIcon
                        hintText={section.hintText}
                    />
                </OfflineWithFeedback>
            ))}
            {nonReimbursable === CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL && (
                <>
                    <ToggleSettingOptionRow
                        title={translate('workspace.accounting.defaultVendor')}
                        subtitle={translate('workspace.qbd.defaultVendorDescription')}
                        switchAccessibilityLabel={translate('workspace.qbd.defaultVendorDescription')}
                        wrapperStyle={[styles.ph5, styles.mb3, styles.mt1]}
                        isActive={!!qbdConfig?.shouldAutoCreateVendor}
                        pendingAction={PolicyUtils.settingsPendingAction(
                            [CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR, CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE],
                            qbdConfig?.pendingFields,
                        )}
                        errors={ErrorUtils.getLatestErrorField(qbdConfig, CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR)}
                        onToggle={(isOn) => QuickbooksDesktop.updateQuickbooksDesktopShouldAutoCreateVendor(policyID, isOn)}
                        onCloseError={() => clearQBDErrorField(policyID, CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR)}
                    />
                    {!!qbdConfig?.shouldAutoCreateVendor && (
                        <OfflineWithFeedback
                            pendingAction={PolicyUtils.settingsPendingAction(
                                [CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR, CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR],
                                qbdConfig?.pendingFields,
                            )}
                        >
                            <MenuItemWithTopDescription
                                title={nonReimbursableBillDefaultVendorObject?.name}
                                description={translate('workspace.accounting.defaultVendor')}
                                onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT.getRoute(policyID))}
                                brickRoadIndicator={
                                    PolicyUtils.areSettingsInErrorFields([CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR], qbdConfig?.errorFields)
                                        ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                                        : undefined
                                }
                                shouldShowRightIcon
                            />
                        </OfflineWithFeedback>
                    )}
                </>
            )}
        </ConnectionLayout>
    );
}

QuickbooksDesktopCompanyCardExpenseAccountPage.displayName = 'QuickbooksDesktopCompanyCardExpenseAccountPage';

export default withPolicyConnections(QuickbooksDesktopCompanyCardExpenseAccountPage);
