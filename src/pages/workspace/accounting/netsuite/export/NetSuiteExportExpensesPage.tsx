import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {ExpenseRouteParams, MenuItem} from '@pages/workspace/accounting/netsuite/types';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type MenuItemWithoutType = Omit<MenuItem, 'type'>;

function NetSuiteExportExpensesPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const route = useRoute();
    const params = route.params as ExpenseRouteParams;
    const isReimbursable = params.expenseType === CONST.NETSUITE_EXPENSE_TYPE.REIMBURSABLE;

    const config = policy?.connections?.netsuite?.options.config;

    const exportDestination = isReimbursable ? config?.reimbursableExpensesExportDestination : config?.nonreimbursableExpensesExportDestination;
    const exportDestinationError = isReimbursable ? config?.errorFields?.reimbursableExpensesExportDestination : config?.errorFields?.nonreimbursableExpensesExportDestination;
    const exportDestinationPending = isReimbursable ? config?.pendingFields?.reimbursableExpensesExportDestination : config?.pendingFields?.nonreimbursableExpensesExportDestination;
    const helperTextType = isReimbursable ? 'reimbursableDescription' : 'nonReimbursableDescription';
    const configType = isReimbursable ? CONST.NETSUITE_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION : CONST.NETSUITE_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION;

    const {vendors, payableList} = policy?.connections?.netsuite?.options?.data ?? {};

    const defaultVendor = useMemo(() => (vendors ?? []).find((vendor) => vendor.id === config?.defaultVendor), [vendors, config?.defaultVendor]);

    const selectedPayableAccount = useMemo(() => (payableList ?? []).find((payableAccount) => payableAccount.id === config?.payableAcct), [payableList, config?.payableAcct]);

    const selectedReimbursablePayableAccount = useMemo(
        () => (payableList ?? []).find((payableAccount) => payableAccount.id === config?.reimbursablePayableAccount),
        [payableList, config?.reimbursablePayableAccount],
    );

    const menuItems: MenuItemWithoutType[] = [
        {
            description: translate('workspace.accounting.exportAs'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_DESTINATION_SELECT.getRoute(policyID, params.expenseType)),
            brickRoadIndicator: exportDestinationError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: exportDestination ? translate(`workspace.netsuite.exportDestination.values.${exportDestination}.label`) : undefined,
            pendingAction: exportDestinationPending,
            errors: ErrorUtils.getLatestErrorField(config, configType),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, configType),
            helperText: exportDestination ? translate(`workspace.netsuite.exportDestination.values.${exportDestination}.${helperTextType}`) : undefined,
            shouldParseHelperText: true,
        },
        {
            description: translate('workspace.accounting.defaultVendor'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_VENDOR_SELECT.getRoute(policyID, params.expenseType)),
            brickRoadIndicator: config?.errorFields?.defaultVendor ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: defaultVendor ? defaultVendor.name : undefined,
            pendingAction: config?.pendingFields?.defaultVendor,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.DEFAULT_VENDOR),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.DEFAULT_VENDOR),
            shouldHide: isReimbursable || exportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL,
        },
        {
            description: translate('workspace.netsuite.nonReimbursableJournalPostingAccount'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT.getRoute(policyID, params.expenseType)),
            brickRoadIndicator: config?.errorFields?.payableAcct ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: selectedPayableAccount ? selectedPayableAccount.name : undefined,
            pendingAction: config?.pendingFields?.payableAcct,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.PAYABLE_ACCT),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.PAYABLE_ACCT),
            shouldHide: isReimbursable || exportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY,
        },
        {
            description: translate('workspace.netsuite.reimbursableJournalPostingAccount'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT.getRoute(policyID, params.expenseType)),
            brickRoadIndicator: config?.errorFields?.reimbursablePayableAccount ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: selectedReimbursablePayableAccount ? selectedReimbursablePayableAccount.name : undefined,
            pendingAction: config?.pendingFields?.reimbursablePayableAccount,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT),
            shouldHide: !isReimbursable || exportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY,
        },
        {
            description: translate('workspace.netsuite.journalPostingPreference.label'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_JOURNAL_POSTING_PREFERENCE_SELECT.getRoute(policyID, params.expenseType)),
            brickRoadIndicator: config?.errorFields?.journalPostingPreference ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            title: config?.journalPostingPreference ? translate(`workspace.netsuite.journalPostingPreference.values.${config.journalPostingPreference}`) : undefined,
            pendingAction: config?.pendingFields?.journalPostingPreference,
            errors: ErrorUtils.getLatestErrorField(config, CONST.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE),
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE),
            shouldHide: exportDestination !== CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY,
        },
    ];

    return (
        <ConnectionLayout
            displayName={NetSuiteExportExpensesPage.displayName}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID))}
            headerTitle={`workspace.accounting.${isReimbursable ? 'exportOutOfPocket' : 'exportCompanyCard'}`}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.CONTROL]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NETSUITE}
        >
            {menuItems
                .filter((item) => !item.shouldHide)
                .map((item) => (
                    <OfflineWithFeedback
                        key={item.description}
                        pendingAction={item.pendingAction}
                        errors={item.errors}
                        onClose={item.onCloseError}
                        errorRowStyles={[styles.ph5]}
                    >
                        <MenuItemWithTopDescription
                            title={item.title}
                            description={item.description}
                            shouldShowRightIcon
                            onPress={item?.onPress}
                            brickRoadIndicator={item?.brickRoadIndicator}
                            helperText={item?.helperText}
                            errorText={item?.errorText}
                            shouldParseHelperText={item.shouldParseHelperText ?? false}
                        />
                    </OfflineWithFeedback>
                ))}
        </ConnectionLayout>
    );
}

NetSuiteExportExpensesPage.displayName = 'NetSuiteExportExpensesPage';

export default withPolicyConnections(NetSuiteExportExpensesPage);
