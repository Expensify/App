import {useEffect, useRef} from 'react';
import type {ValueOf} from 'type-fest';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {SelectorType} from '@components/SelectionScreen';
import useInitial from '@hooks/useInitial';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import Navigation from '@libs/Navigation/Navigation';
import {findSelectedBankAccountWithDefaultSelect, findSelectedVendorWithDefaultSelect, getCurrentConnectionName, getSageIntacctNonReimbursableActiveDefaultVendor} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Card, CompanyCardFeed, CompanyCardFeedWithDomainID, Policy} from '@src/types/onyx';
import type {Account, PolicyConnectionName} from '@src/types/onyx/Policy';

type AssignCardRoute =
    | ReturnType<typeof ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE.getRoute>
    | ReturnType<typeof ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_INVITE_NEW_MEMBER.getRoute>
    | ReturnType<typeof ROUTES.WORKSPACE_COMPANY_CARDS_BANK_CONNECTION.getRoute>
    | ReturnType<typeof ROUTES.WORKSPACE_COMPANY_CARDS_PLAID_CONNECTION.getRoute>
    | ReturnType<typeof ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_SELECT.getRoute>
    | ReturnType<typeof ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_TRANSACTION_START_DATE_STEP.getRoute>
    | ReturnType<typeof ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_NAME.getRoute>
    | ReturnType<typeof ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION.getRoute>;

type AddNewCardRoute =
    | ReturnType<typeof ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_SELECT_COUNTRY.getRoute>
    | ReturnType<typeof ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_SELECT_BANK.getRoute>
    | ReturnType<typeof ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_SELECT_FEED_TYPE.getRoute>
    | ReturnType<typeof ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_CARD_TYPE.getRoute>
    | ReturnType<typeof ROUTES.WORKSPACE_COMPANY_CARDS_BANK_CONNECTION.getRoute>
    | ReturnType<typeof ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_CARD_INSTRUCTIONS.getRoute>
    | ReturnType<typeof ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_CARD_NAME.getRoute>
    | ReturnType<typeof ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_CARD_DETAILS.getRoute>
    | ReturnType<typeof ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_AMEX_CUSTOM_FEED.getRoute>
    | ReturnType<typeof ROUTES.WORKSPACE_COMPANY_CARDS_PLAID_CONNECTION.getRoute>
    | ReturnType<typeof ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_SELECT_STATEMENT_CLOSE_DATE.getRoute>
    | ReturnType<typeof ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_SELECT_DIRECT_STATEMENT_CLOSE_DATE.getRoute>;

type ExportIntegration = {
    title?: string;
    description?: string;
    exportPageLink: string;
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
    backTo?: string | undefined,
): ExportIntegration | undefined {
    const currentConnectionName = getCurrentConnectionName(policy);
    const defaultCard = translate('workspace.moreFeatures.companyCards.defaultCard');
    const defaultVendor = translate('workspace.accounting.defaultVendor');

    const defaultMenuItem: Account & {value?: string} = {
        name: defaultCard,
        value: defaultCard,
        id: defaultCard,
        currency: '',
    };

    const defaultVendorMenuItem: Account & {value?: string} = {
        name: defaultVendor,
        value: defaultVendor,
        id: defaultVendor,
        currency: '',
    };

    const {nonReimbursableExpensesExportDestination, nonReimbursableExpensesAccount, reimbursableExpensesExportDestination, reimbursableExpensesAccount} =
        policy?.connections?.quickbooksOnline?.config ?? {};
    const {export: exportConfig} = policy?.connections?.intacct?.config ?? {};
    const {export: exportConfiguration} = policy?.connections?.xero?.config ?? {};
    const config = policy?.connections?.netsuite?.options?.config;
    const {bankAccounts} = policy?.connections?.xero?.data ?? {};
    const {creditCards, bankAccounts: quickbooksOnlineBankAccounts} = policy?.connections?.quickbooksOnline?.data ?? {};
    const {creditCardAccounts} = policy?.connections?.quickbooksDesktop?.data ?? {};
    const {export: exportQBD} = policy?.connections?.quickbooksDesktop?.config ?? {};

    switch (connectionName) {
        case CONST.POLICY.CONNECTIONS.NAME.QBO: {
            const typeNonReimbursable = nonReimbursableExpensesExportDestination ? translate(`workspace.qbo.accounts.${nonReimbursableExpensesExportDestination}`) : undefined;
            const typeReimbursable = reimbursableExpensesExportDestination ? translate(`workspace.qbo.accounts.${reimbursableExpensesExportDestination}`) : undefined;
            const type = typeNonReimbursable ?? typeReimbursable;
            const description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', {integration: currentConnectionName, type}) : undefined;
            let data: Account[];
            let shouldShowMenuItem = nonReimbursableExpensesExportDestination !== CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL;
            let selectedAccount: Account | undefined;
            const defaultAccount = nonReimbursableExpensesAccount?.name ?? reimbursableExpensesAccount?.name;
            let isDefaultTitle = false;
            let exportType: ValueOf<typeof CONST.COMPANY_CARDS.EXPORT_CARD_TYPES> | undefined;
            const qboConfig = nonReimbursableExpensesExportDestination ?? reimbursableExpensesExportDestination;
            switch (qboConfig) {
                case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
                case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
                case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD: {
                    data = creditCards ?? [];
                    isDefaultTitle = !!(
                        defaultAccount &&
                        (!companyCard?.nameValuePairs?.quickbooks_online_export_account ||
                            companyCard?.nameValuePairs?.quickbooks_online_export_account === CONST.COMPANY_CARDS.DEFAULT_EXPORT_TYPE)
                    );
                    selectedAccount = (creditCards ?? []).find((currentCard) => currentCard.id === (companyCard?.nameValuePairs?.quickbooks_online_export_account ?? defaultAccount));
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
                    selectedAccount = (quickbooksOnlineBankAccounts ?? []).find(
                        (bank) => bank.id === (companyCard?.nameValuePairs?.quickbooks_online_export_account_debit ?? defaultAccount),
                    );
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
                title: isDefaultTitle ? defaultCard : selectedAccount?.name,
                exportType,
                shouldShowMenuItem,
                exportPageLink: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID, backTo),
                data: resultData.map((card) => ({
                    value: card.id,
                    text: card.name,
                    keyForList: card.name,
                    isSelected: isDefaultTitle ? card.name === defaultCard : card.id === selectedAccount?.id,
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
                shouldShowMenuItem: !!exportConfiguration?.nonReimbursableAccount,
                title: isDefaultTitle ? defaultCard : selectedAccount?.name,
                exportPageLink: ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID, backTo),
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
            const typeNonreimbursable = config?.nonreimbursableExpensesExportDestination
                ? translate(`workspace.netsuite.exportDestination.values.${config.nonreimbursableExpensesExportDestination}.label`)
                : undefined;
            const typeReimbursable = config?.reimbursableExpensesExportDestination
                ? translate(`workspace.netsuite.exportDestination.values.${config.reimbursableExpensesExportDestination}.label`)
                : undefined;
            const type = typeNonreimbursable ?? typeReimbursable;
            let title: string | undefined = '';
            let exportType: ValueOf<typeof CONST.COMPANY_CARDS.EXPORT_CARD_TYPES> | undefined;
            let shouldShowMenuItem = true;
            const description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', {integration: currentConnectionName, type}) : undefined;
            let data: SelectorType[];
            let defaultAccount: string | undefined = '';
            let isDefaultTitle = false;

            const netSuiteConfig = config?.nonreimbursableExpensesExportDestination ?? config?.reimbursableExpensesExportDestination;

            switch (netSuiteConfig) {
                case CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL: {
                    const vendors = policy?.connections?.netsuite?.options.data.vendors;
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    defaultAccount = config?.defaultVendor || vendors?.[0]?.id;
                    isDefaultTitle = !!(
                        defaultAccount &&
                        (!companyCard?.nameValuePairs?.netsuite_export_vendor || companyCard?.nameValuePairs?.netsuite_export_vendor === CONST.COMPANY_CARDS.DEFAULT_EXPORT_TYPE)
                    );
                    const selectedVendor = findSelectedVendorWithDefaultSelect(vendors, companyCard?.nameValuePairs?.netsuite_export_vendor ?? defaultAccount);
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
                    const payableAccounts = policy?.connections?.netsuite?.options.data.payableList;
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    defaultAccount = config?.payableAcct || payableAccounts?.[0]?.id;
                    isDefaultTitle = !!(
                        defaultAccount &&
                        (!companyCard?.nameValuePairs?.netsuite_export_payable_account ||
                            companyCard?.nameValuePairs?.netsuite_export_payable_account === CONST.COMPANY_CARDS.DEFAULT_EXPORT_TYPE)
                    );
                    const selectedPayableAccount = findSelectedBankAccountWithDefaultSelect(payableAccounts, companyCard?.nameValuePairs?.netsuite_export_payable_account ?? defaultAccount);
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
                exportPageLink: ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID, backTo),
            };
        }
        case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT: {
            const isNonReimbursable = !!exportConfig?.nonReimbursable;
            const isReimbursable = !!exportConfig?.reimbursable;
            const typeNonReimbursable = isNonReimbursable ? translate(`workspace.sageIntacct.nonReimbursableExpenses.values.${exportConfig.nonReimbursable}`) : undefined;
            const typeReimbursable = isReimbursable ? translate(`workspace.sageIntacct.reimbursableExpenses.values.${exportConfig.reimbursable}`) : undefined;
            const type = typeNonReimbursable ?? typeReimbursable;
            const description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', {integration: currentConnectionName, type}) : undefined;
            let exportType: ValueOf<typeof CONST.COMPANY_CARDS.EXPORT_CARD_TYPES> | undefined;
            let title: string | undefined = '';
            let isDefaultTitle = false;

            let shouldShowMenuItem = true;
            let data: SelectorType[];

            const sageConfig = exportConfig?.nonReimbursable ?? exportConfig?.reimbursable;

            switch (sageConfig) {
                case CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL:
                case CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL: {
                    const defaultAccount = isNonReimbursable ? getSageIntacctNonReimbursableActiveDefaultVendor(policy) : exportConfig?.reimbursableExpenseReportDefaultVendor;
                    isDefaultTitle = !!(
                        companyCard?.nameValuePairs?.intacct_export_vendor === CONST.COMPANY_CARDS.DEFAULT_EXPORT_TYPE || !companyCard?.nameValuePairs?.intacct_export_vendor
                    );
                    const vendors = policy?.connections?.intacct?.data?.vendors ?? [];
                    const selectedVendorID = companyCard?.nameValuePairs?.intacct_export_vendor ?? defaultAccount;
                    const selectedVendor = (vendors ?? []).find(({id}) => id === selectedVendorID);
                    title = isDefaultTitle ? defaultVendor : selectedVendor?.value;
                    const resultData = (vendors ?? []).length > 0 ? [defaultVendorMenuItem, ...(vendors ?? [])] : vendors;
                    data = (resultData ?? []).map(({id, value}) => {
                        return {
                            value: id,
                            text: value,
                            keyForList: id,
                            isSelected: isDefaultTitle ? value === defaultVendor : selectedVendor?.id === id,
                        };
                    });
                    exportType = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_INTACCT_EXPORT_VENDOR;
                    break;
                }
                case CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE: {
                    const intacctCreditCards = policy?.connections?.intacct?.data?.creditCards ?? [];
                    const activeDefaultVendor = getSageIntacctNonReimbursableActiveDefaultVendor(policy);

                    const defaultVendorAccount = (policy?.connections?.intacct?.data?.vendors ?? []).find((vendor) => vendor.id === activeDefaultVendor);
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    const defaultAccount = exportConfig?.nonReimbursableAccount || defaultVendorAccount;
                    isDefaultTitle = !!(
                        companyCard?.nameValuePairs?.intacct_export_charge_card === CONST.COMPANY_CARDS.DEFAULT_EXPORT_TYPE || !companyCard?.nameValuePairs?.intacct_export_charge_card
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
                exportPageLink: ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.getRoute(policyID, backTo),
                data,
            };
        }
        case CONST.POLICY.CONNECTIONS.NAME.QBD: {
            const nonReimbursableExpenses = exportQBD?.nonReimbursable;
            const reimbursableExpenses = exportQBD?.reimbursable;
            const typeNonReimbursable = nonReimbursableExpenses ? translate(`workspace.qbd.accounts.${nonReimbursableExpenses}`) : undefined;
            const typeReimbursable = reimbursableExpenses ? translate(`workspace.qbd.accounts.${reimbursableExpenses}`) : undefined;
            const type = typeNonReimbursable ?? typeReimbursable;
            const description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', {integration: currentConnectionName, type}) : undefined;
            let data: Account[];
            let shouldShowMenuItem =
                nonReimbursableExpenses !== CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK &&
                nonReimbursableExpenses !== CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL;
            let title: string | undefined = '';
            let selectedAccount: string | undefined = '';
            const defaultAccount = exportQBD?.nonReimbursableAccount ?? exportQBD?.reimbursableAccount;
            let isDefaultTitle = false;
            let exportType: ValueOf<typeof CONST.COMPANY_CARDS.EXPORT_CARD_TYPES> | undefined;
            const qbdConfig = nonReimbursableExpenses ?? reimbursableExpenses;
            switch (qbdConfig) {
                case CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
                case CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
                case CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                case CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD: {
                    data = creditCardAccounts ?? [];
                    isDefaultTitle = !!(
                        companyCard?.nameValuePairs?.quickbooks_desktop_export_account_credit === CONST.COMPANY_CARDS.DEFAULT_EXPORT_TYPE ||
                        (defaultAccount && !companyCard?.nameValuePairs?.quickbooks_desktop_export_account_credit)
                    );
                    title = isDefaultTitle ? defaultCard : companyCard?.nameValuePairs?.quickbooks_desktop_export_account_credit;
                    selectedAccount = companyCard?.nameValuePairs?.quickbooks_desktop_export_account_credit ?? defaultAccount;
                    exportType = CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_DESKTOP_EXPORT_ACCOUNT_CREDIT;
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
                exportPageLink: ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT.getRoute(policyID, backTo),
                data: resultData.map((card) => ({
                    value: card.name,
                    text: card.name,
                    keyForList: card.name,
                    isSelected: isDefaultTitle ? card.name === defaultCard : card.name === selectedAccount,
                })),
            };
        }

        default:
            return undefined;
    }
}

function useAssignCardNavigation(policyID: string | undefined, feed: CompanyCardFeed | CompanyCardFeedWithDomainID | undefined, isStartStep = false) {
    const [assignCard] = useOnyx(ONYXKEYS.ASSIGN_CARD, {canBeMissing: true});
    const currentStep = assignCard?.currentStep;
    const previousStepRef = useRef(currentStep);
    const firstAssigneeEmail = useInitial(assignCard?.data?.email);
    const shouldUseBackToParam = !firstAssigneeEmail || firstAssigneeEmail === assignCard?.data?.email;

    useEffect(() => {
        if (!policyID || !currentStep || !feed) {
            return;
        }

        if (currentStep === previousStepRef.current && !isStartStep) {
            return;
        }

        previousStepRef.current = currentStep;

        const stepRoutes: Record<string, AssignCardRoute> = {
            [CONST.COMPANY_CARD.STEP.ASSIGNEE]: ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE.getRoute(policyID, feed),
            [CONST.COMPANY_CARD.STEP.INVITE_NEW_MEMBER]: ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_INVITE_NEW_MEMBER.getRoute(policyID, feed),
            [CONST.COMPANY_CARD.STEP.BANK_CONNECTION]: ROUTES.WORKSPACE_COMPANY_CARDS_BANK_CONNECTION.getRoute(
                policyID,
                feed,
                ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD.getRoute(policyID, feed),
            ),
            [CONST.COMPANY_CARD.STEP.PLAID_CONNECTION]: ROUTES.WORKSPACE_COMPANY_CARDS_PLAID_CONNECTION.getRoute(policyID, feed),
            [CONST.COMPANY_CARD.STEP.CARD]: ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_SELECT.getRoute(policyID, feed),
            [CONST.COMPANY_CARD.STEP.TRANSACTION_START_DATE]: ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_TRANSACTION_START_DATE_STEP.getRoute(policyID, feed),
            [CONST.COMPANY_CARD.STEP.CARD_NAME]: ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_NAME.getRoute(policyID, feed),
            [CONST.COMPANY_CARD.STEP.CONFIRMATION]: ROUTES.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION.getRoute(policyID, feed),
        };

        const targetRoute: AssignCardRoute = stepRoutes[currentStep];
        if (targetRoute) {
           Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(targetRoute));
        }
    }, [currentStep, policyID, feed, isStartStep, shouldUseBackToParam]);
}

function useAddNewCardNavigation(policyID: string | undefined, isStartStep = false) {
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD, {canBeMissing: true});
    const currentStep = addNewCard?.currentStep;
    const previousStepRef = useRef(currentStep);
    const {isBetaEnabled} = usePermissions();
    const defaultStep = isBetaEnabled(CONST.BETAS.PLAID_COMPANY_CARDS) ? CONST.COMPANY_CARDS.STEP.SELECT_COUNTRY : CONST.COMPANY_CARDS.STEP.SELECT_BANK;

    useEffect(() => {
        if (!policyID) {
            return;
        }

        if (currentStep === previousStepRef.current && !isStartStep) {
            return;
        }

        previousStepRef.current = currentStep;

        const stepRoutes: Record<string, AddNewCardRoute> = {
            [CONST.COMPANY_CARDS.STEP.SELECT_COUNTRY]: ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_SELECT_COUNTRY.getRoute(policyID),
            [CONST.COMPANY_CARDS.STEP.SELECT_BANK]: ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_SELECT_BANK.getRoute(policyID),
            [CONST.COMPANY_CARDS.STEP.SELECT_FEED_TYPE]: ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_SELECT_FEED_TYPE.getRoute(policyID),
            [CONST.COMPANY_CARDS.STEP.CARD_TYPE]: ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_CARD_TYPE.getRoute(policyID),
            [CONST.COMPANY_CARDS.STEP.BANK_CONNECTION]: ROUTES.WORKSPACE_COMPANY_CARDS_BANK_CONNECTION.getRoute(
                policyID,
                addNewCard?.data?.selectedBank ?? '',
                ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW.getRoute(policyID),
            ),
            [CONST.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS]: ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_CARD_INSTRUCTIONS.getRoute(policyID),
            [CONST.COMPANY_CARDS.STEP.CARD_NAME]: ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_CARD_NAME.getRoute(policyID),
            [CONST.COMPANY_CARDS.STEP.CARD_DETAILS]: ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_CARD_DETAILS.getRoute(policyID),
            [CONST.COMPANY_CARDS.STEP.AMEX_CUSTOM_FEED]: ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_AMEX_CUSTOM_FEED.getRoute(policyID),
            [CONST.COMPANY_CARDS.STEP.PLAID_CONNECTION]: ROUTES.WORKSPACE_COMPANY_CARDS_PLAID_CONNECTION.getRoute(policyID, addNewCard?.data?.selectedBank ?? ''),
            [CONST.COMPANY_CARDS.STEP.SELECT_STATEMENT_CLOSE_DATE]: ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_SELECT_STATEMENT_CLOSE_DATE.getRoute(policyID),
            [CONST.COMPANY_CARDS.STEP.SELECT_DIRECT_STATEMENT_CLOSE_DATE]: ROUTES.WORKSPACE_COMPANY_CARDS_ADD_NEW_SELECT_DIRECT_STATEMENT_CLOSE_DATE.getRoute(policyID),
        };

        const targetRoute: AddNewCardRoute = currentStep ? stepRoutes[currentStep] : stepRoutes[defaultStep];
        if (targetRoute) {
           Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(targetRoute));
        }
    }, [currentStep, policyID, isStartStep, addNewCard?.data?.selectedBank, defaultStep]);
}

// eslint-disable-next-line import/prefer-default-export
export {getExportMenuItem, useAssignCardNavigation, useAddNewCardNavigation};
