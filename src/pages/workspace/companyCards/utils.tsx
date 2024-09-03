import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {SelectorType} from '@components/SelectionScreen';
import * as PolicyUtils from '@libs/PolicyUtils';
import {
    findSelectedBankAccountWithDefaultSelect,
    findSelectedVendorWithDefaultSelect,
    getNetSuitePayableAccountOptions,
    getNetSuiteVendorOptions,
    getSageIntacctCreditCards,
    getSageIntacctNonReimbursableActiveDefaultVendor,
    getSageIntacctVendors,
    getXeroBankAccounts,
} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import {getDefaultVendorName} from '@pages/workspace/accounting/intacct/export/utils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {Account, PolicyConnectionName} from '@src/types/onyx/Policy';

type ExportIntegration = {
    title?: string;
    description?: string;
    onExportPagePress: () => void;
    data: SelectorType[];
};

function getExportMenuItem(connectionName: PolicyConnectionName | undefined, policyID: string, translate: LocaleContextProps['translate'], policy?: Policy): ExportIntegration | undefined {
    const currentConnectionName = PolicyUtils.getCurrentConnectionName(policy);

    const {nonReimbursableExpensesExportDestination, nonReimbursableExpensesAccount} = policy?.connections?.quickbooksOnline?.config ?? {};
    const {export: exportConfig} = policy?.connections?.intacct?.config ?? {};
    const {data: intacctData} = policy?.connections?.intacct ?? {};
    const {export: exportConfiguration} = policy?.connections?.xero?.config ?? {};
    const {bankAccounts} = policy?.connections?.xero?.data ?? {};
    const config = policy?.connections?.netsuite?.options.config;
    const {creditCards, bankAccounts: quickbooksOnlineBankAccounts} = policy?.connections?.quickbooksOnline?.data ?? {};

    const {vendors, payableList} = policy?.connections?.netsuite?.options?.data ?? {};

    switch (connectionName) {
        case CONST.POLICY.CONNECTIONS.NAME.QBO: {
            const type = nonReimbursableExpensesExportDestination ? translate(`workspace.qbo.accounts.${nonReimbursableExpensesExportDestination}`) : undefined;
            const description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', currentConnectionName, type) : undefined;
            let data: Account[];
            switch (nonReimbursableExpensesExportDestination) {
                case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD:
                    data = creditCards ?? [];
                    break;
                case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD:
                    data = quickbooksOnlineBankAccounts ?? [];
                    break;
                default:
                    data = [];
            }

            return {
                description,
                title: nonReimbursableExpensesAccount?.name,
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID)),
                data: data.map((card) => ({
                    value: card.name,
                    text: card.name,
                    keyForList: card.name,
                    isSelected: card.name === nonReimbursableExpensesAccount?.name,
                })),
            };
        }
        case CONST.POLICY.CONNECTIONS.NAME.XERO: {
            const type = translate('workspace.xero.xeroBankAccount');
            const description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', currentConnectionName, type) : undefined;
            const selectedAccount = (bankAccounts ?? []).find((bank) => bank.id === exportConfiguration?.nonReimbursableAccount);

            return {
                description,
                title: selectedAccount?.name ?? bankAccounts?.[0]?.name ?? '',
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID)),
                data: getXeroBankAccounts(policy ?? undefined, exportConfiguration?.nonReimbursableAccount),
            };
        }
        case CONST.POLICY.CONNECTIONS.NAME.NETSUITE: {
            const type = config?.nonreimbursableExpensesExportDestination
                ? translate(`workspace.netsuite.exportDestination.values.${config.nonreimbursableExpensesExportDestination}.label`)
                : undefined;
            const description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', currentConnectionName, type) : undefined;
            let data: SelectorType[];
            switch (config?.nonreimbursableExpensesExportDestination) {
                case CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL:
                    data = getNetSuiteVendorOptions(policy ?? undefined, config?.defaultVendor);
                    break;
                case CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY:
                    data = getNetSuitePayableAccountOptions(policy ?? undefined, config?.payableAcct);
                    break;
                default:
                    data = [];
            }
            const isVendor = CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT === config?.nonreimbursableExpensesExportDestination;
            const defaultVendor = findSelectedVendorWithDefaultSelect(vendors, config?.defaultVendor);
            const selectedPayableAccount = findSelectedBankAccountWithDefaultSelect(payableList, config?.payableAcct);
            return {
                description,
                title: isVendor ? defaultVendor?.name : selectedPayableAccount?.name,
                data,
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID)),
            };
        }
        case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT: {
            const isVendor = exportConfig?.nonReimbursable === CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL;
            const type = exportConfig?.nonReimbursable ? translate(`workspace.sageIntacct.nonReimbursableExpenses.values.${exportConfig.nonReimbursable}`) : undefined;
            const description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', currentConnectionName, type) : undefined;
            const activeDefaultVendor = getSageIntacctNonReimbursableActiveDefaultVendor(policy);
            const defaultVendorName = getDefaultVendorName(activeDefaultVendor, intacctData?.vendors);

            return {
                description,
                title: isVendor ? defaultVendorName : exportConfig?.nonReimbursableAccount,
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.getRoute(policyID)),
                data: isVendor ? getSageIntacctVendors(policy, activeDefaultVendor) : getSageIntacctCreditCards(policy, exportConfig?.nonReimbursableAccount),
            };
        }
        default:
            return undefined;
    }
}

// eslint-disable-next-line import/prefer-default-export
export {getExportMenuItem};
