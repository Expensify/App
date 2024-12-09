import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, findSelectedBankAccountWithDefaultSelect, findSelectedVendorWithDefaultSelect, settingsPendingAction} from '@libs/PolicyUtils';
import type {ExpenseRouteParams, MenuItem} from '@pages/workspace/accounting/netsuite/types';
import {
    exportExpensesDestinationSettingName,
    shouldHideJournalPostingPreference,
    shouldHideNonReimbursableJournalPostingAccount,
    shouldHideReimbursableDefaultVendor,
    shouldHideReimbursableJournalPostingAccount,
} from '@pages/workspace/accounting/netsuite/utils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type MenuItemWithSubscribedSettings = Pick<MenuItem, 'description' | 'title' | 'onPress' | 'shouldHide' | 'onCloseError' | 'helperText' | 'shouldParseHelperText'> & {
    subscribedSettings?: string[];
};

function NetSuiteExportExpensesPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const route = useRoute();
    const params = route.params as ExpenseRouteParams;
    const isReimbursable = params.expenseType === CONST.NETSUITE_EXPENSE_TYPE.REIMBURSABLE;

    const config = policy?.connections?.netsuite?.options.config;

    const exportDestinationSettingName = exportExpensesDestinationSettingName(isReimbursable);
    const exportDestination = config?.[exportDestinationSettingName];
    const helperTextType = isReimbursable ? 'reimbursableDescription' : 'nonReimbursableDescription';

    const {vendors, payableList} = policy?.connections?.netsuite?.options?.data ?? {};

    const defaultVendor = useMemo(() => findSelectedVendorWithDefaultSelect(vendors, config?.defaultVendor), [vendors, config?.defaultVendor]);

    const selectedPayableAccount = useMemo(() => findSelectedBankAccountWithDefaultSelect(payableList, config?.payableAcct), [payableList, config?.payableAcct]);

    const selectedReimbursablePayableAccount = useMemo(
        () => findSelectedBankAccountWithDefaultSelect(payableList, config?.reimbursablePayableAccount),
        [payableList, config?.reimbursablePayableAccount],
    );

    const menuItems: MenuItemWithSubscribedSettings[] = [
        {
            description: translate('workspace.accounting.exportAs'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_DESTINATION_SELECT.getRoute(policyID, params.expenseType)),
            title: exportDestination ? translate(`workspace.netsuite.exportDestination.values.${exportDestination}.label`) : undefined,
            subscribedSettings: [exportDestinationSettingName],
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, exportDestinationSettingName),
            helperText: exportDestination ? translate(`workspace.netsuite.exportDestination.values.${exportDestination}.${helperTextType}`) : undefined,
            shouldParseHelperText: true,
        },
        {
            description: translate('workspace.accounting.defaultVendor'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_VENDOR_SELECT.getRoute(policyID, params.expenseType)),
            title: defaultVendor ? defaultVendor.name : undefined,
            subscribedSettings: [CONST.NETSUITE_CONFIG.DEFAULT_VENDOR],
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.DEFAULT_VENDOR),
            shouldHide: shouldHideReimbursableDefaultVendor(isReimbursable, config),
        },
        {
            description: translate('workspace.netsuite.nonReimbursableJournalPostingAccount'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT.getRoute(policyID, params.expenseType)),
            title: selectedPayableAccount ? selectedPayableAccount.name : undefined,
            subscribedSettings: [CONST.NETSUITE_CONFIG.PAYABLE_ACCT],
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.PAYABLE_ACCT),
            shouldHide: shouldHideNonReimbursableJournalPostingAccount(isReimbursable, config),
        },
        {
            description: translate('workspace.netsuite.reimbursableJournalPostingAccount'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT.getRoute(policyID, params.expenseType)),
            title: selectedReimbursablePayableAccount ? selectedReimbursablePayableAccount.name : undefined,
            subscribedSettings: [CONST.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT],
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT),
            shouldHide: shouldHideReimbursableJournalPostingAccount(isReimbursable, config),
        },
        {
            description: translate('workspace.netsuite.journalPostingPreference.label'),
            onPress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_JOURNAL_POSTING_PREFERENCE_SELECT.getRoute(policyID, params.expenseType)),
            title: config?.journalPostingPreference
                ? translate(`workspace.netsuite.journalPostingPreference.values.${config.journalPostingPreference}`)
                : translate(`workspace.netsuite.journalPostingPreference.values.${CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE}`),
            subscribedSettings: [CONST.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE],
            onCloseError: () => Policy.clearNetSuiteErrorField(policyID, CONST.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE),
            shouldHide: shouldHideJournalPostingPreference(isReimbursable, config),
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
                        pendingAction={settingsPendingAction(item.subscribedSettings, config?.pendingFields)}
                    >
                        <MenuItemWithTopDescription
                            title={item.title}
                            description={item.description}
                            shouldShowRightIcon
                            onPress={item?.onPress}
                            brickRoadIndicator={areSettingsInErrorFields(item.subscribedSettings, config?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            helperText={item?.helperText}
                            shouldParseHelperText={item.shouldParseHelperText ?? false}
                        />
                    </OfflineWithFeedback>
                ))}
        </ConnectionLayout>
    );
}

NetSuiteExportExpensesPage.displayName = 'NetSuiteExportExpensesPage';

export default withPolicyConnections(NetSuiteExportExpensesPage);
