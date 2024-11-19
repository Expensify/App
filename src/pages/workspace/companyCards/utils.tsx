import type {ValueOf} from 'type-fest';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {SelectorType} from '@components/SelectionScreen';
import * as PolicyUtils from '@libs/PolicyUtils';
import {
    getNetSuitePayableAccountOptions,
    getNetSuiteVendorOptions,
    getSageIntacctCreditCards,
    getSageIntacctNonReimbursableActiveDefaultVendor,
    getSageIntacctVendors,
    getXeroBankAccounts,
} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Card, Policy} from '@src/types/onyx';
import type {Account, PolicyConnectionName} from '@src/types/onyx/Policy';

type ExportIntegration = {
    title?: string;
    description?: string;
    onExportPagePress: () => void;
    data: SelectorType[];
    exportType?: ValueOf<typeof CONST.COMPANY_CARDS.EXPORT_CARD_TYPES>;
    shouldShowMenuItem?: boolean;
};

function getExportMenuItem(
    connectionName: PolicyConnectionName | undefined,
    policyID: string,
    translate: LocaleContextProps['translate'],
    policy?: Policy,
    companyCard?: Card,
): ExportIntegration | undefined {
    const currentConnectionName = PolicyUtils.getCurrentConnectionName(policy);

    const {nonReimbursableExpensesExportDestination, nonReimbursableExpensesAccount} = policy?.connections?.quickbooksOnline?.config ?? {};
    const {export: exportConfig} = policy?.connections?.intacct?.config ?? {};
    const {export: exportConfiguration} = policy?.connections?.xero?.config ?? {};
    const config = policy?.connections?.netsuite?.options.config;
    const {bankAccounts} = policy?.connections?.xero?.data ?? {};
    const {creditCards, bankAccounts: quickbooksOnlineBankAccounts} = policy?.connections?.quickbooksOnline?.data ?? {};

    switch (connectionName) {
        case CONST.POLICY.CONNECTIONS.NAME.QBO: {
            const type = nonReimbursableExpensesExportDestination ? translate(`workspace.qbo.accounts.${nonReimbursableExpensesExportDestination}`) : undefined;
            const description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', {integration: currentConnectionName, type}) : undefined;
            let data: Account[];
            let shouldShowMenuItem = true;
            let title: string | undefined = '';
            let exportType: ValueOf<typeof CONST.COMPANY_CARDS.EXPORT_CARD_TYPES> | undefined;
            switch (nonReimbursableExpensesExportDestination) {
                case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD:
                    data = creditCards ?? [];
                    title = companyCard?.nameValuePairs?.quickbooks_desktop_export_account_credit ?? nonReimbursableExpensesAccount?.name;
                    exportType = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_DESKTOP_EXPORT_ACCOUNT_CREDIT;
                    break;
                case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD:
                    data = quickbooksOnlineBankAccounts ?? [];
                    title = companyCard?.nameValuePairs?.quickbooks_online_export_account_debit ?? nonReimbursableExpensesAccount?.name;
                    exportType = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT_DEBIT;
                    break;
                default:
                    shouldShowMenuItem = false;
                    data = [];
            }

            return {
                description,
                title,
                exportType,
                shouldShowMenuItem,
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID)),
                data: data.map((card) => ({
                    value: card.name,
                    text: card.name,
                    keyForList: card.name,
                    isSelected: card.name === title,
                })),
            };
        }
        case CONST.POLICY.CONNECTIONS.NAME.XERO: {
            const type = translate('workspace.xero.xeroBankAccount');
            const description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', {integration: currentConnectionName, type}) : undefined;
            const exportType = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_XERO_EXPORT_BANK_ACCOUNT;
            const selectedAccount = (bankAccounts ?? []).find((bank) => bank.id === exportConfiguration?.nonReimbursableAccount);
            return {
                description,
                exportType,
                shouldShowMenuItem: true,
                title: companyCard?.nameValuePairs?.xero_export_bank_account ?? selectedAccount?.name ?? bankAccounts?.[0]?.name ?? '',
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID)),
                data: getXeroBankAccounts(policy ?? undefined, exportConfiguration?.nonReimbursableAccount),
            };
        }
        case CONST.POLICY.CONNECTIONS.NAME.NETSUITE: {
            const type = config?.nonreimbursableExpensesExportDestination
                ? translate(`workspace.netsuite.exportDestination.values.${config.nonreimbursableExpensesExportDestination}.label`)
                : undefined;
            let title: string | undefined = '';
            let exportType: ValueOf<typeof CONST.COMPANY_CARDS.EXPORT_CARD_TYPES> | undefined;
            let shouldShowMenuItem = true;
            const description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', {integration: currentConnectionName, type}) : undefined;
            let data: SelectorType[];
            switch (config?.nonreimbursableExpensesExportDestination) {
                case CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL:
                    data = getNetSuiteVendorOptions(policy ?? undefined, config?.defaultVendor);
                    title = companyCard?.nameValuePairs?.netsuite_export_vendor ?? data.find((exportVendor) => exportVendor.isSelected)?.text;
                    exportType = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_NETSUITE_EXPORT_VENDOR;
                    break;
                case CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY:
                    data = getNetSuitePayableAccountOptions(policy ?? undefined, config?.payableAcct);
                    title = companyCard?.nameValuePairs?.netsuite_export_payable_account ?? data.find((exportPayable) => exportPayable.isSelected)?.text;
                    exportType = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_NETSUITE_EXPORT_ACCOUNT;
                    break;
                default:
                    shouldShowMenuItem = false;
                    data = [];
            }
            return {
                description,
                title,
                shouldShowMenuItem,
                exportType,
                data,
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID)),
            };
        }
        case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT: {
            const isVendor = exportConfig?.nonReimbursable === CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL;
            const type = exportConfig?.nonReimbursable ? translate(`workspace.sageIntacct.nonReimbursableExpenses.values.${exportConfig.nonReimbursable}`) : undefined;
            const description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', {integration: currentConnectionName, type}) : undefined;
            const activeDefaultVendor = getSageIntacctNonReimbursableActiveDefaultVendor(policy);
            const data = isVendor ? getSageIntacctVendors(policy, activeDefaultVendor) : getSageIntacctCreditCards(policy, exportConfig?.nonReimbursableAccount);
            const selectedAccount = data.find((account) => account.isSelected)?.text;

            return {
                description,
                shouldShowMenuItem: true,
                exportType: isVendor ? CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_INTACCT_EXPORT_VENDOR : CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_INTACCT_EXPORT_CHARGE_CARD,
                title: isVendor ? companyCard?.nameValuePairs?.intacct_export_vendor ?? selectedAccount : companyCard?.nameValuePairs?.intacct_export_charge_card ?? selectedAccount,
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.getRoute(policyID)),
                data,
            };
        }
        default:
            return undefined;
    }
}

// eslint-disable-next-line import/prefer-default-export
export {getExportMenuItem};
