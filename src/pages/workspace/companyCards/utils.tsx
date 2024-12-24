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

    const defaultMenuItem: Account & {value?: string} = {
        name: defaultCard,
        value: defaultCard,
        id: defaultCard,
        currency: '',
    };

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
                    isDefaultTitle = !!(
                        defaultAccount &&
                        (!companyCard?.nameValuePairs?.quickbooks_online_export_account ||
                            companyCard?.nameValuePairs?.quickbooks_online_export_account === CONST.COMPANY_CARDS.DEFAULT_EXPORT_TYPE)
                    );
                    title = isDefaultTitle ? defaultCard : companyCard?.nameValuePairs?.quickbooks_online_export_account;
                    selectedAccount = companyCard?.nameValuePairs?.quickbooks_online_export_account ?? defaultAccount;
                    exportType = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT;
                    break;
                }
                case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD: {
                    data = quickbooksOnlineBankAccounts ?? [];
                    isDefaultTitle = !!(
                        defaultAccount &&
                        (!companyCard?.nameValuePairs?.quickbooks_online_export_account_debit ||
                            companyCard?.nameValuePairs?.quickbooks_online_export_account_debit === CONST.COMPANY_CARDS.DEFAULT_EXPORT_TYPE)
                    );
                    title = isDefaultTitle ? defaultCard : companyCard?.nameValuePairs?.quickbooks_online_export_account_debit;
                    selectedAccount = companyCard?.nameValuePairs?.quickbooks_online_export_account_debit ?? defaultAccount;
                    exportType = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT_DEBIT;
                    break;
                }
                default:
                    shouldShowMenuItem = false;
                    data = [];
            }

            const resultData = data.length > 0 ? [defaultMenuItem, ...data] : data;

            return {
                description,
                title,
                exportType,
                shouldShowMenuItem,
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID)),
                data: resultData.map((card) => ({
                    value: card.name,
                    text: card.name,
                    keyForList: card.name,
                    isSelected: isDefaultTitle ? card.name === defaultCard : card.name === selectedAccount,
                })),
            };
        }
        case CONST.POLICY.CONNECTIONS.NAME.XERO: {
            const type = translate('workspace.xero.xeroBankAccount');
            const description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', {integration: type}) : undefined;
            const exportType = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_XERO_EXPORT_BANK_ACCOUNT;
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const defaultAccount = exportConfiguration?.nonReimbursableAccount || bankAccounts?.[0]?.id;
            const isDefaultTitle = !!(
                defaultAccount &&
                (!companyCard?.nameValuePairs?.xero_export_bank_account || companyCard?.nameValuePairs?.xero_export_bank_account === CONST.COMPANY_CARDS.DEFAULT_EXPORT_TYPE)
            );
            const selectedAccount = (bankAccounts ?? []).find((bank) => bank.id === (companyCard?.nameValuePairs?.xero_export_bank_account ?? defaultAccount));
            const resultData = (bankAccounts ?? [])?.length > 0 ? [defaultMenuItem, ...(bankAccounts ?? [])] : bankAccounts;

            return {
                description,
                exportType,
                shouldShowMenuItem: true,
                title: isDefaultTitle ? defaultCard : selectedAccount?.name,
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID)),
                data: (resultData ?? []).map((card) => {
                    return {
                        value: card.id,
                        text: card.name,
                        keyForList: card.id,
                        isSelected: isDefaultTitle ? card.name === defaultCard : selectedAccount?.id === card.id,
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
                    const vendors = policy?.connections?.netsuite.options.data.vendors;
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    defaultAccount = config?.defaultVendor || vendors?.[0]?.id;
                    isDefaultTitle = !!(
                        defaultAccount &&
                        (!companyCard?.nameValuePairs?.netsuite_export_vendor || companyCard?.nameValuePairs?.netsuite_export_vendor === CONST.COMPANY_CARDS.DEFAULT_EXPORT_TYPE)
                    );
                    const selectedVendor = PolicyUtils.findSelectedVendorWithDefaultSelect(vendors, companyCard?.nameValuePairs?.netsuite_export_vendor ?? defaultAccount);
                    title = isDefaultTitle ? defaultCard : selectedVendor?.name;
                    const resultData = (vendors ?? []).length > 0 ? [defaultMenuItem, ...(vendors ?? [])] : vendors;
                    data = (resultData ?? []).map(({id, name}) => {
                        return {
                            value: id,
                            text: name,
                            keyForList: id,
                            isSelected: isDefaultTitle ? name === defaultCard : selectedVendor?.id === id,
                        };
                    });
                    exportType = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_NETSUITE_EXPORT_VENDOR;
                    break;
                }
                case CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY: {
                    const payableAccounts = policy?.connections?.netsuite.options.data.payableList;
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    defaultAccount = config?.payableAcct || payableAccounts?.[0]?.id;
                    isDefaultTitle = !!(
                        defaultAccount &&
                        (!companyCard?.nameValuePairs?.netsuite_export_payable_account ||
                            companyCard?.nameValuePairs?.netsuite_export_payable_account === CONST.COMPANY_CARDS.DEFAULT_EXPORT_TYPE)
                    );
                    const selectedPayableAccount = PolicyUtils.findSelectedBankAccountWithDefaultSelect(
                        payableAccounts,
                        companyCard?.nameValuePairs?.netsuite_export_payable_account ?? defaultAccount,
                    );
                    title = isDefaultTitle ? defaultCard : selectedPayableAccount?.name;
                    const resultData = (payableAccounts ?? []).length > 0 ? [defaultMenuItem, ...(payableAccounts ?? [])] : payableAccounts;
                    data = (resultData ?? []).map(({id, name}) => {
                        return {
                            value: id,
                            text: name,
                            keyForList: id,
                            isSelected: isDefaultTitle ? name === defaultCard : selectedPayableAccount?.id === id,
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
                    isDefaultTitle = !!(
                        companyCard?.nameValuePairs?.intacct_export_vendor === CONST.COMPANY_CARDS.DEFAULT_EXPORT_TYPE ||
                        (defaultAccount && !companyCard?.nameValuePairs?.intacct_export_vendor)
                    );
                    const vendors = policy?.connections?.intacct?.data?.vendors ?? [];
                    const selectedVendorID = companyCard?.nameValuePairs?.intacct_export_vendor ?? defaultAccount;
                    const selectedVendor = (vendors ?? []).find(({id}) => id === selectedVendorID);
                    title = isDefaultTitle ? defaultCard : selectedVendor?.value;
                    const resultData = (vendors ?? []).length > 0 ? [defaultMenuItem, ...(vendors ?? [])] : vendors;
                    data = (resultData ?? []).map(({id, value}) => {
                        return {
                            value: id,
                            text: value,
                            keyForList: id,
                            isSelected: isDefaultTitle ? value === defaultCard : selectedVendor?.id === id,
                        };
                    });
                    exportType = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_INTACCT_EXPORT_VENDOR;
                    break;
                }
                case CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE: {
                    const intacctCreditCards = policy?.connections?.intacct?.data?.creditCards ?? [];
                    const activeDefaultVendor = PolicyUtils.getSageIntacctNonReimbursableActiveDefaultVendor(policy);

                    const defaultVendorAccount = (policy?.connections?.intacct?.data?.vendors ?? []).find((vendor) => vendor.id === activeDefaultVendor);
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    const defaultAccount = exportConfig?.nonReimbursableAccount || defaultVendorAccount;
                    isDefaultTitle = !!(
                        companyCard?.nameValuePairs?.intacct_export_charge_card === CONST.COMPANY_CARDS.DEFAULT_EXPORT_TYPE ||
                        (defaultAccount && !companyCard?.nameValuePairs?.intacct_export_charge_card)
                    );
                    const selectedVendorID = companyCard?.nameValuePairs?.intacct_export_charge_card ?? defaultAccount;
                    const selectedCard = (intacctCreditCards ?? []).find(({id}) => id === selectedVendorID);
                    title = isDefaultTitle ? defaultCard : selectedCard?.name;
                    const resultData = (intacctCreditCards ?? []).length > 0 ? [defaultMenuItem, ...(intacctCreditCards ?? [])] : intacctCreditCards;

                    data = (resultData ?? []).map(({id, name}) => {
                        return {
                            value: id,
                            text: name,
                            keyForList: id,
                            isSelected: isDefaultTitle ? name === defaultCard : selectedCard?.id === id,
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
