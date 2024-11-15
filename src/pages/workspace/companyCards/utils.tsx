import type {ValueOf} from 'type-fest';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {SelectorType} from '@components/SelectionScreen';
import * as PolicyUtils from '@libs/PolicyUtils';
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
    const defaultCard = translate('workspace.moreFeatures.companyCards.defaultCard');

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
            let selectedAccount: string | undefined = '';
            const defaultAccount = nonReimbursableExpensesAccount?.name;
            let isDefaultTitle = false;
            let exportType: ValueOf<typeof CONST.COMPANY_CARDS.EXPORT_CARD_TYPES> | undefined;
            switch (nonReimbursableExpensesExportDestination) {
                case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD: {
                    data = creditCards ?? [];
                    const isDefaultSelected = defaultAccount && companyCard?.nameValuePairs?.quickbooks_online_export_account === defaultAccount;
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    isDefaultTitle = !!(isDefaultSelected || (!companyCard?.nameValuePairs?.quickbooks_online_export_account && defaultAccount));
                    title = isDefaultTitle ? defaultCard : companyCard?.nameValuePairs?.quickbooks_online_export_account;
                    selectedAccount = companyCard?.nameValuePairs?.quickbooks_online_export_account ?? defaultAccount;
                    exportType = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT;
                    break;
                }
                case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD: {
                    data = quickbooksOnlineBankAccounts ?? [];
                    const isDefaultSelected = defaultAccount && companyCard?.nameValuePairs?.quickbooks_online_export_account_debit === defaultAccount;
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    isDefaultTitle = !!(isDefaultSelected || (!companyCard?.nameValuePairs?.quickbooks_online_export_account_debit && defaultAccount));
                    title = isDefaultTitle ? defaultCard : companyCard?.nameValuePairs?.quickbooks_online_export_account_debit;
                    selectedAccount = companyCard?.nameValuePairs?.quickbooks_online_export_account_debit ?? defaultAccount;
                    exportType = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT_DEBIT;
                    break;
                }
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
                data: data.map((card) => {
                    const isDefault = card.name === defaultAccount;
                    return {
                        value: card.name,
                        text: isDefault ? defaultCard : card.name,
                        keyForList: card.name,
                        isSelected: card.name === selectedAccount,
                    };
                }),
            };
        }
        case CONST.POLICY.CONNECTIONS.NAME.XERO: {
            const type = translate('workspace.xero.xeroBankAccount');
            const description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', {integration: currentConnectionName, type}) : undefined;
            const exportType = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_XERO_EXPORT_BANK_ACCOUNT;
            const defaultAccount = exportConfiguration?.nonReimbursableAccount;
            const isDefaultSelected = defaultAccount && companyCard?.nameValuePairs?.xero_export_bank_account === defaultAccount;
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const isDefaultTitle = !!(isDefaultSelected || (!companyCard?.nameValuePairs?.xero_export_bank_account && defaultAccount));
            const selectedAccount = (bankAccounts ?? []).find((bank) => bank.id === (companyCard?.nameValuePairs?.xero_export_bank_account ?? defaultAccount));
            return {
                description,
                exportType,
                shouldShowMenuItem: true,
                title: isDefaultTitle ? defaultCard : selectedAccount?.name,
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID)),
                data: (bankAccounts ?? []).map((card) => {
                    const isDefault = card.id === defaultAccount;
                    return {
                        value: card.id,
                        text: isDefault ? defaultCard : card.name,
                        keyForList: card.id,
                        isSelected: selectedAccount?.id === card.id,
                    };
                }),
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
            let defaultAccount: string | undefined = '';
            let isDefaultTitle = false;

            switch (config?.nonreimbursableExpensesExportDestination) {
                case CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL: {
                    defaultAccount = config?.defaultVendor;
                    const isDefaultSelected = defaultAccount && companyCard?.nameValuePairs?.netsuite_export_vendor === defaultAccount;
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    isDefaultTitle = !!(isDefaultSelected || (!companyCard?.nameValuePairs?.netsuite_export_vendor && defaultAccount));
                    const vendors = policy?.connections?.netsuite.options.data.vendors;
                    const selectedVendor = PolicyUtils.findSelectedVendorWithDefaultSelect(vendors, companyCard?.nameValuePairs?.netsuite_export_vendor ?? defaultAccount);
                    title = isDefaultTitle ? defaultCard : selectedVendor?.name;
                    data = (vendors ?? []).map(({id, name}) => {
                        const isDefault = id === defaultAccount;
                        return {
                            value: id,
                            text: isDefault ? defaultCard : name,
                            keyForList: id,
                            isSelected: selectedVendor?.id === id,
                        };
                    });
                    exportType = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_NETSUITE_EXPORT_VENDOR;
                    break;
                }
                case CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY: {
                    defaultAccount = config?.payableAcct;
                    const isDefaultSelected = defaultAccount && companyCard?.nameValuePairs?.netsuite_export_payable_account === defaultAccount;
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    isDefaultTitle = !!(isDefaultSelected || (!companyCard?.nameValuePairs?.netsuite_export_payable_account && defaultAccount));
                    const payableAccounts = policy?.connections?.netsuite.options.data.payableList;
                    const selectedPayableAccount = PolicyUtils.findSelectedBankAccountWithDefaultSelect(
                        payableAccounts,
                        companyCard?.nameValuePairs?.netsuite_export_payable_account ?? defaultAccount,
                    );
                    title = isDefaultTitle ? defaultCard : selectedPayableAccount?.name;
                    data = (payableAccounts ?? []).map(({id, name}) => {
                        const isDefault = id === defaultAccount;
                        return {
                            value: id,
                            text: isDefault ? defaultCard : name,
                            keyForList: id,
                            isSelected: selectedPayableAccount?.id === id,
                        };
                    });
                    title = companyCard?.nameValuePairs?.netsuite_export_payable_account ?? data.find((exportPayable) => exportPayable.isSelected)?.text;
                    exportType = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_NETSUITE_EXPORT_ACCOUNT;
                    break;
                }
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
            const type = exportConfig?.nonReimbursable ? translate(`workspace.sageIntacct.nonReimbursableExpenses.values.${exportConfig.nonReimbursable}`) : undefined;
            const description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', {integration: currentConnectionName, type}) : undefined;
            let exportType: ValueOf<typeof CONST.COMPANY_CARDS.EXPORT_CARD_TYPES> | undefined;
            let title: string | undefined = '';
            let isDefaultTitle = false;

            let shouldShowMenuItem = true;
            let data: SelectorType[];

            switch (exportConfig?.nonReimbursable) {
                case CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL: {
                    const defaultAccount = PolicyUtils.getSageIntacctNonReimbursableActiveDefaultVendor(policy);
                    const isDefaultSelected = defaultAccount && companyCard?.nameValuePairs?.netsuite_export_payable_account === defaultAccount;
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    isDefaultTitle = !!(isDefaultSelected || (!companyCard?.nameValuePairs?.netsuite_export_payable_account && defaultAccount));
                    const vendors = policy?.connections?.intacct?.data?.vendors ?? [];
                    const selectedVendor = PolicyUtils.findSelectedSageVendorWithDefaultSelect(vendors, companyCard?.nameValuePairs?.netsuite_export_payable_account ?? defaultAccount);
                    title = isDefaultTitle ? defaultCard : selectedVendor?.name;

                    data = (vendors ?? []).map(({id, name}) => {
                        const isDefault = id === defaultAccount;
                        return {
                            value: id,
                            text: isDefault ? defaultCard : name,
                            keyForList: id,
                            isSelected: selectedVendor?.id === id,
                        };
                    });
                    exportType = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_INTACCT_EXPORT_VENDOR;
                    break;
                }
                case CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE: {
                    const defaultAccount = exportConfig?.nonReimbursableAccount;
                    const isDefaultSelected = defaultAccount && companyCard?.nameValuePairs?.intacct_export_charge_card === defaultAccount;
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    isDefaultTitle = !!(isDefaultSelected || (!companyCard?.nameValuePairs?.intacct_export_charge_card && defaultAccount));
                    const intacctCreditCards = policy?.connections?.intacct?.data?.creditCards ?? [];
                    const selectedCard = PolicyUtils.findSelectedSageVendorWithDefaultSelect(intacctCreditCards, companyCard?.nameValuePairs?.intacct_export_charge_card ?? defaultAccount);
                    title = isDefaultTitle ? defaultCard : selectedCard?.name;

                    data = (intacctCreditCards ?? []).map(({id, name}) => {
                        const isDefault = id === defaultAccount;
                        return {
                            value: id,
                            text: isDefault ? defaultCard : name,
                            keyForList: id,
                            isSelected: selectedCard?.id === id,
                        };
                    });
                    exportType = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_INTACCT_EXPORT_CHARGE_CARD;

                    break;
                }
                default:
                    shouldShowMenuItem = false;
                    data = [];
            }

            return {
                description,
                shouldShowMenuItem,
                exportType,
                title,
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
