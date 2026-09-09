import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {SelectorType} from '@components/SelectionScreen';

import {sortDefaultToTop} from '@libs/ListUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getSageIntacctNonReimbursableActiveDefaultVendor} from '@libs/PolicyUtils';

import {getCurrentAccountingIntegrationName} from '@pages/workspace/accounting/utils';

import type {ThemeStyles} from '@styles/index';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Card, CompanyCardFeedWithDomainID, Policy} from '@src/types/onyx';
import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type {PolicyConnectionName} from '@src/types/onyx/Policy';

import type {ValueOf} from 'type-fest';

type ExportIntegration = {
    title?: string;
    description?: string;
    exportPageLink?: string;
    data: SelectorType[];
    exportType?: ValueOf<typeof CONST.COMPANY_CARDS.EXPORT_CARD_TYPES>;
    shouldHideMenuItemDescription?: boolean;
    shouldShowMenuItemIcon?: boolean;
    shouldShowMenuItem?: boolean;
};

/** An export account candidate, normalized so every integration shares one resolution path. */
type ExportAccountOption = {
    /** Value stored in the card's export NVP, and the option's value */
    id: string;

    /** Text shown for this account */
    label: string;

    /** Option key, which QBO and QBD key by label because they stored display names before they stored ids */
    keyForList: string;
};

/** A Rillet or DualEntry account, which the connection config can point at by GL code rather than by id. */
type ProgramAccountOption = ExportAccountOption & {
    /** Value the connection config stores to reference this account: the GL code for Rillet, the id for DualEntry */
    configKey: string;

    /** Whether the account is offered in the option list */
    isSelectable: boolean;
};

/** One NVP resolved against one flat candidate list. Used by QBO, Xero, NetSuite, Sage Intacct and QBD. */
type SingleAccountExport = {
    type: typeof CONST.COMPANY_CARDS.EXPORT_RESOLVER.SINGLE_ACCOUNT;

    /** The card NVP holding this integration's export account */
    nvpKey: ValueOf<typeof CONST.COMPANY_CARDS.EXPORT_CARD_TYPES>;

    accounts: ExportAccountOption[];

    /** Shown when the card follows the workspace default */
    defaultLabel: string;

    /** The workspace's own export account, only reachable when the card has no NVP of its own */
    workspaceDefaultAccountID?: string;

    /** Whether a missed id match should be retried against the account labels */
    shouldFallBackToLabelMatch?: boolean;
};

/** One NVP resolved against a program account that each card feed can override. Used by Rillet and DualEntry. */
type ProgramAccountExport = {
    type: typeof CONST.COMPANY_CARDS.EXPORT_RESOLVER.PROGRAM_ACCOUNT;

    /** The card NVP holding this integration's export account */
    nvpKey: typeof CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT | typeof CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_DUALENTRY_EXPORT_ACCOUNT;

    /** Every account, in connection order, because an account that is no longer offered can still be the resolved one */
    accounts: ProgramAccountOption[];

    /** Config key of the workspace wide program account */
    workspaceProgramAccountKey?: string;

    /** Program account overrides, per card feed */
    programAccountKeysByFeed?: Record<CardFeedWithNumber, string>;

    /** Prefixes the resolved title */
    exportsToLabel: string;

    /** Marks the workspace default inside the title, already lower cased */
    defaultTitleSuffix: string;

    /** Marks the workspace default in the option list */
    defaultOptionPrefix: string;
};

/**
 * Everything about a workspace's card export that does not depend on an individual card. Resolve this once per
 * workspace, then resolve each card's title against it.
 */
type CardExportSettings = {
    description?: string;
    exportPageLink?: string;
    exportType?: ValueOf<typeof CONST.COMPANY_CARDS.EXPORT_CARD_TYPES>;
    shouldShowMenuItem?: boolean;
    shouldHideMenuItemDescription?: boolean;
    shouldShowMenuItemIcon?: boolean;

    /** Absent when the connection's export configuration has no per card account to resolve */
    accountSelection?: SingleAccountExport | ProgramAccountExport;
};

/** One card's resolved export account. */
type CardExportAccountSelection = {
    title?: string;

    /** Whether the card follows the workspace default */
    isDefaultTitle: boolean;

    /** Resolved account id, which marks the selected option */
    selectedAccountID?: string;

    /** Program account for this card's feed, which marks the default option */
    programAccountID?: string;
};

/**
 * Puts an integration's accounts into the shared shape. QBO and QBD keyed their options by display name before ids
 * were stored, so those two pass `shouldKeyByLabel`.
 */
function normalizeAccounts(accounts: Array<{id: string; name: string}> | undefined, shouldKeyByLabel = false): ExportAccountOption[] {
    return (accounts ?? []).map(({id, name}) => ({id, label: name, keyForList: shouldKeyByLabel ? name : id}));
}

/**
 * Builds the option list for an integration that resolves one NVP against a flat account list, with the workspace
 * default prepended. The default entry carries the label in all three of its fields, which is what every integration
 * did before they shared this builder.
 */
function buildSingleAccountOptions(accountSelection: SingleAccountExport, selection: CardExportAccountSelection): SelectorType[] {
    const options =
        accountSelection.accounts.length > 0
            ? [{id: accountSelection.defaultLabel, label: accountSelection.defaultLabel, keyForList: accountSelection.defaultLabel}, ...accountSelection.accounts]
            : [];

    return options.map((option) => ({
        value: option.id,
        text: option.label,
        keyForList: option.keyForList,
        isSelected: selection.isDefaultTitle ? option.label === accountSelection.defaultLabel : option.id === selection.selectedAccountID,
    }));
}

/**
 * Builds the option list for an integration whose default comes from a program account. The program account's option
 * carries an empty value, which is how these two integrations signal "follow the default" to the export account page.
 */
function buildProgramAccountOptions(accountSelection: ProgramAccountExport, selection: CardExportAccountSelection, styles: ThemeStyles): SelectorType[] {
    const options = accountSelection.accounts
        .filter((account) => account.isSelectable)
        .map((account) => ({
            value: selection.programAccountID === account.id ? '' : account.id,
            text: `${selection.programAccountID === account.id ? `${accountSelection.defaultOptionPrefix} - ` : ''}${account.label}`,
            keyForList: account.id,
            isSelected: selection.selectedAccountID === account.id,
        }));

    return sortDefaultToTop(options, (option) => selection.programAccountID === option.keyForList, styles);
}

function buildExportAccountOptions(accountSelection: CardExportSettings['accountSelection'], selection: CardExportAccountSelection, styles: ThemeStyles): SelectorType[] {
    if (!accountSelection) {
        return [];
    }

    return accountSelection.type === CONST.COMPANY_CARDS.EXPORT_RESOLVER.SINGLE_ACCOUNT
        ? buildSingleAccountOptions(accountSelection, selection)
        : buildProgramAccountOptions(accountSelection, selection, styles);
}

/**
 * Resolves everything about a workspace's card export that is the same for all of its cards. This is the expensive
 * half of the work, so a list of cards resolves it once and then resolves each card's title against the result.
 */
function getPolicyCardExportSettings(
    connectionName: PolicyConnectionName | undefined,
    policyID: string,
    translate: LocaleContextProps['translate'],
    policy?: Policy,
    backTo?: string | undefined,
): CardExportSettings | undefined {
    const basePath = ROUTES.POLICY_ACCOUNTING.getRoute(policyID);
    const currentConnectionName = getCurrentAccountingIntegrationName(policy, translate);
    const defaultCard = translate('workspace.moreFeatures.companyCards.defaultCard');
    const defaultVendor = translate('workspace.accounting.defaultVendor');
    const defaultAccount = translate('workspace.accounting.defaultAccount');

    // The default option label matches the export method: a vendor bill exports to a vendor, a journal entry/check to an account, and a card to a card.
    const getDefaultExportLabel = (exportDestination: string | undefined): string => {
        switch (exportDestination) {
            case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL:
            case CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                return defaultVendor;
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
            case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
            case CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
            case CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
                return defaultAccount;
            default:
                return defaultCard;
        }
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
            const description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', currentConnectionName, type) : undefined;
            const exportPageLink = createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.path, backTo ?? basePath);
            const shouldShowMenuItem = nonReimbursableExpensesExportDestination !== CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL;
            const workspaceDefaultAccountID = nonReimbursableExpensesAccount?.name ?? reimbursableExpensesAccount?.name;
            const qboConfig = nonReimbursableExpensesExportDestination ?? reimbursableExpensesExportDestination;
            const defaultLabel = getDefaultExportLabel(qboConfig);

            switch (qboConfig) {
                case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
                case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
                case CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD:
                    return {
                        description,
                        exportPageLink,
                        shouldShowMenuItem,
                        exportType: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT,
                        accountSelection: {
                            type: CONST.COMPANY_CARDS.EXPORT_RESOLVER.SINGLE_ACCOUNT,
                            nvpKey: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT,
                            accounts: normalizeAccounts(creditCards, true),
                            defaultLabel,
                            workspaceDefaultAccountID,
                        },
                    };
                case CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD:
                    return {
                        description,
                        exportPageLink,
                        shouldShowMenuItem,
                        exportType: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT_DEBIT,
                        accountSelection: {
                            type: CONST.COMPANY_CARDS.EXPORT_RESOLVER.SINGLE_ACCOUNT,
                            nvpKey: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT_DEBIT,
                            accounts: normalizeAccounts(quickbooksOnlineBankAccounts, true),
                            defaultLabel,
                            workspaceDefaultAccountID,
                        },
                    };
                default:
                    return {description, exportPageLink, shouldShowMenuItem: false};
            }
        }
        case CONST.POLICY.CONNECTIONS.NAME.XERO: {
            const type = translate('workspace.xero.bankAccount');
            const description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', currentConnectionName, type) : undefined;

            return {
                description,
                shouldShowMenuItem: !!exportConfiguration?.nonReimbursableAccount,
                exportType: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_XERO_EXPORT_BANK_ACCOUNT,
                accountSelection: {
                    type: CONST.COMPANY_CARDS.EXPORT_RESOLVER.SINGLE_ACCOUNT,
                    nvpKey: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_XERO_EXPORT_BANK_ACCOUNT,
                    accounts: normalizeAccounts(bankAccounts),
                    defaultLabel: defaultAccount,
                    workspaceDefaultAccountID: exportConfiguration?.nonReimbursableAccount,
                },
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
            const description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', currentConnectionName, type) : undefined;
            const exportPageLink = createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.path, backTo ?? basePath);
            const netSuiteConfig = config?.nonreimbursableExpensesExportDestination ?? config?.reimbursableExpensesExportDestination;

            switch (netSuiteConfig) {
                case CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL:
                    return {
                        description,
                        exportPageLink,
                        shouldShowMenuItem: true,
                        exportType: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_NETSUITE_EXPORT_VENDOR,
                        accountSelection: {
                            type: CONST.COMPANY_CARDS.EXPORT_RESOLVER.SINGLE_ACCOUNT,
                            nvpKey: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_NETSUITE_EXPORT_VENDOR,
                            accounts: normalizeAccounts(policy?.connections?.netsuite?.options.data.vendors),
                            defaultLabel: defaultVendor,
                            workspaceDefaultAccountID: config?.defaultVendor,
                        },
                    };
                case CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY:
                    return {
                        description,
                        exportPageLink,
                        shouldShowMenuItem: true,
                        exportType: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_NETSUITE_EXPORT_ACCOUNT,
                        accountSelection: {
                            type: CONST.COMPANY_CARDS.EXPORT_RESOLVER.SINGLE_ACCOUNT,
                            nvpKey: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_NETSUITE_EXPORT_ACCOUNT,
                            accounts: normalizeAccounts(policy?.connections?.netsuite?.options.data.payableList),
                            defaultLabel: defaultAccount,
                            workspaceDefaultAccountID: config?.payableAcct,
                        },
                    };
                default:
                    return {description, exportPageLink, shouldShowMenuItem: false};
            }
        }
        case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT: {
            const isNonReimbursable = !!exportConfig?.nonReimbursable;
            const isReimbursable = !!exportConfig?.reimbursable;
            const typeNonReimbursable = isNonReimbursable ? translate(`workspace.sageIntacct.nonReimbursableExpenses.values.${exportConfig.nonReimbursable}`) : undefined;
            const typeReimbursable = isReimbursable ? translate(`workspace.sageIntacct.reimbursableExpenses.values.${exportConfig.reimbursable}`) : undefined;
            const type = typeNonReimbursable ?? typeReimbursable;
            const description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', currentConnectionName, type) : undefined;
            const exportPageLink = createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.path, backTo ?? basePath);
            const sageConfig = exportConfig?.nonReimbursable ?? exportConfig?.reimbursable;

            switch (sageConfig) {
                case CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL:
                case CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL:
                    return {
                        description,
                        exportPageLink,
                        shouldShowMenuItem: true,
                        exportType: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_INTACCT_EXPORT_VENDOR,
                        accountSelection: {
                            type: CONST.COMPANY_CARDS.EXPORT_RESOLVER.SINGLE_ACCOUNT,
                            nvpKey: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_INTACCT_EXPORT_VENDOR,
                            // Sage Intacct holds a vendor's display text in `value`, so that is the label rather than `name`.
                            accounts: (policy?.connections?.intacct?.data?.vendors ?? []).map(({id, value}) => ({id, label: value, keyForList: id})),
                            defaultLabel: defaultVendor,
                            workspaceDefaultAccountID: isNonReimbursable ? getSageIntacctNonReimbursableActiveDefaultVendor(policy) : exportConfig?.reimbursableExpenseReportDefaultVendor,
                        },
                    };
                case CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE: {
                    const activeDefaultVendor = getSageIntacctNonReimbursableActiveDefaultVendor(policy);
                    const defaultVendorAccount = (policy?.connections?.intacct?.data?.vendors ?? []).find((vendor) => vendor.id === activeDefaultVendor);

                    return {
                        description,
                        exportPageLink,
                        shouldShowMenuItem: true,
                        exportType: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_INTACCT_EXPORT_CHARGE_CARD,
                        accountSelection: {
                            type: CONST.COMPANY_CARDS.EXPORT_RESOLVER.SINGLE_ACCOUNT,
                            nvpKey: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_INTACCT_EXPORT_CHARGE_CARD,
                            accounts: normalizeAccounts(policy?.connections?.intacct?.data?.creditCards),
                            defaultLabel: defaultCard,
                            // A card with no export NVP of its own is titled from `defaultLabel`, so this id is never
                            // looked up. It is kept for parity with the other integrations.
                            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                            workspaceDefaultAccountID: exportConfig?.nonReimbursableAccount || defaultVendorAccount?.id,
                        },
                    };
                }
                default:
                    return {description, exportPageLink, shouldShowMenuItem: false};
            }
        }
        case CONST.POLICY.CONNECTIONS.NAME.QBD: {
            const nonReimbursableExpenses = exportQBD?.nonReimbursable;
            const reimbursableExpenses = exportQBD?.reimbursable;
            const typeNonReimbursable = nonReimbursableExpenses ? translate(`workspace.qbd.accounts.${nonReimbursableExpenses}`) : undefined;
            const typeReimbursable = reimbursableExpenses ? translate(`workspace.qbd.accounts.${reimbursableExpenses}`) : undefined;
            const type = typeNonReimbursable ?? typeReimbursable;
            const description = currentConnectionName && type ? translate('workspace.moreFeatures.companyCards.integrationExport', currentConnectionName, type) : undefined;
            const exportPageLink = createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT.path, backTo ?? basePath);
            const shouldShowMenuItem =
                nonReimbursableExpenses !== CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK &&
                nonReimbursableExpenses !== CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL;
            const qbdConfig = nonReimbursableExpenses ?? reimbursableExpenses;

            switch (qbdConfig) {
                case CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY:
                case CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK:
                case CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL:
                case CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD:
                    return {
                        description,
                        exportPageLink,
                        shouldShowMenuItem,
                        exportType: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_DESKTOP_EXPORT_ACCOUNT_CREDIT,
                        accountSelection: {
                            type: CONST.COMPANY_CARDS.EXPORT_RESOLVER.SINGLE_ACCOUNT,
                            nvpKey: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_QUICKBOOKS_DESKTOP_EXPORT_ACCOUNT_CREDIT,
                            accounts: normalizeAccounts(creditCardAccounts, true),
                            defaultLabel: getDefaultExportLabel(qbdConfig),
                            // Classic saved an account id in this NVP while NewDot used to save the display name, so a
                            // missed id match is retried against the labels.
                            shouldFallBackToLabelMatch: true,
                        },
                    };
                default:
                    return {description, exportPageLink, shouldShowMenuItem: false};
            }
        }
        case CONST.POLICY.CONNECTIONS.NAME.RILLET: {
            const rilletConfig = policy?.connections?.rillet?.config;
            const rilletData = policy?.connections?.rillet?.data;
            const exportReimbursable = rilletConfig?.export?.reimbursable ?? CONST.RILLET_EXPORT_REIMBURSABLE.VENDOR_BILL;
            const exportNonReimbursable = rilletConfig?.export?.nonReimbursable ?? CONST.RILLET_EXPORT_NON_REIMBURSABLE.CREDIT_CARD_CHARGE;

            return {
                description: currentConnectionName
                    ? translate('workspace.moreFeatures.companyCards.integrationExport', currentConnectionName, translate('workspace.rillet.cardAccount.label'))
                    : undefined,
                exportType: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT,
                shouldHideMenuItemDescription: true,
                shouldShowMenuItemIcon: true,
                shouldShowMenuItem:
                    rilletConfig?.export?.exportToMultipleAccounts &&
                    exportReimbursable === CONST.RILLET_EXPORT_REIMBURSABLE.VENDOR_BILL &&
                    exportNonReimbursable === CONST.RILLET_EXPORT_NON_REIMBURSABLE.CREDIT_CARD_CHARGE,
                accountSelection: {
                    type: CONST.COMPANY_CARDS.EXPORT_RESOLVER.PROGRAM_ACCOUNT,
                    nvpKey: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_RILLET_EXPORT_ACCOUNT,
                    accounts: (rilletData?.accounts ?? []).map((account) => ({
                        id: account.id,
                        label: `${account.code} ${account.name}`,
                        keyForList: account.id,
                        configKey: account.code,
                        isSelectable:
                            account.type === CONST.RILLET_ACCOUNT_TYPE.LIABILITY &&
                            account.subtype === CONST.RILLET_ACCOUNT_SUBTYPE.CREDIT_CARD &&
                            account.status === CONST.RILLET_ACCOUNT_STATUS.ACTIVE,
                    })),
                    workspaceProgramAccountKey: rilletConfig?.export?.creditCardAccountCode,
                    programAccountKeysByFeed: rilletConfig?.export?.cardProgramAccounts,
                    exportsToLabel: translate('common.exportsTo'),
                    defaultTitleSuffix: translate('common.default').toLocaleLowerCase(),
                    defaultOptionPrefix: translate('common.default'),
                },
            };
        }
        case CONST.POLICY.CONNECTIONS.NAME.DUALENTRY: {
            const dualentryConfig = policy?.connections?.dualEntry?.config;
            const dualentryData = policy?.connections?.dualEntry?.data;
            const exportReimbursable = dualentryConfig?.export?.reimbursable ?? CONST.DUALENTRY_EXPORT_REIMBURSABLE.VENDOR_BILL;
            const exportNonReimbursable = dualentryConfig?.export?.nonReimbursable ?? CONST.DUALENTRY_EXPORT_NON_REIMBURSABLE.DIRECT_EXPENSE;

            return {
                description: currentConnectionName
                    ? translate('workspace.moreFeatures.companyCards.integrationExport', currentConnectionName, translate('workspace.dualEntry.cardAccount.label'))
                    : undefined,
                exportType: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_DUALENTRY_EXPORT_ACCOUNT,
                shouldHideMenuItemDescription: true,
                shouldShowMenuItemIcon: true,
                shouldShowMenuItem:
                    dualentryConfig?.export?.exportToMultipleAccounts &&
                    exportReimbursable === CONST.DUALENTRY_EXPORT_REIMBURSABLE.VENDOR_BILL &&
                    exportNonReimbursable === CONST.DUALENTRY_EXPORT_NON_REIMBURSABLE.DIRECT_EXPENSE,
                accountSelection: {
                    type: CONST.COMPANY_CARDS.EXPORT_RESOLVER.PROGRAM_ACCOUNT,
                    nvpKey: CONST.COMPANY_CARDS.EXPORT_CARD_TYPES.NVP_DUALENTRY_EXPORT_ACCOUNT,
                    accounts: (dualentryData?.accounts ?? []).map((account) => ({
                        id: account.id,
                        label: `${account.id} ${account.name}`,
                        keyForList: account.id,
                        // DualEntry's config references a program account by id, where Rillet's references it by GL code.
                        configKey: account.id,
                        isSelectable: account.isActive && (account.accountType === CONST.DUALENTRY_ACCOUNT_TYPE.CREDIT_CARD || account.accountType === CONST.DUALENTRY_ACCOUNT_TYPE.BANK),
                    })),
                    workspaceProgramAccountKey: dualentryConfig?.export?.creditCardAccountID,
                    programAccountKeysByFeed: dualentryConfig?.export?.cardProgramAccounts,
                    exportsToLabel: translate('common.exportsTo'),
                    defaultTitleSuffix: translate('common.default').toLocaleLowerCase(),
                    defaultOptionPrefix: translate('common.default'),
                },
            };
        }
        default:
            return undefined;
    }
}

/**
 * Resolves one card's export account against its workspace's export settings. This is the cheap half of the work: a
 * couple of lookups and no allocation, so a table can call it per row.
 */
function getCardExportAccountSelection(settings: CardExportSettings | undefined, companyCard: Card | undefined): CardExportAccountSelection {
    const accountSelection = settings?.accountSelection;

    if (!accountSelection) {
        return {isDefaultTitle: false};
    }

    if (accountSelection.type === CONST.COMPANY_CARDS.EXPORT_RESOLVER.SINGLE_ACCOUNT) {
        const nvpValue = companyCard?.nameValuePairs?.[accountSelection.nvpKey];
        const isDefaultTitle = !nvpValue || nvpValue === CONST.COMPANY_CARDS.DEFAULT_EXPORT_TYPE;
        const candidateID = nvpValue ?? accountSelection.workspaceDefaultAccountID;
        const selectedAccount =
            accountSelection.accounts.find((account) => account.id === candidateID) ??
            (accountSelection.shouldFallBackToLabelMatch ? accountSelection.accounts.find((account) => account.label === candidateID) : undefined);

        return {
            isDefaultTitle,
            title: isDefaultTitle ? accountSelection.defaultLabel : selectedAccount?.label,
            selectedAccountID: selectedAccount?.id,
        };
    }

    const programAccountKey = (companyCard?.bank ? accountSelection.programAccountKeysByFeed?.[companyCard.bank] : undefined) ?? accountSelection.workspaceProgramAccountKey;
    const programAccount = accountSelection.accounts.find((account) => account.configKey === programAccountKey);
    const isUsingCustomAccount = !!companyCard?.nameValuePairs && accountSelection.nvpKey in companyCard.nameValuePairs;
    const selectedAccountID = (isUsingCustomAccount ? companyCard?.nameValuePairs?.[accountSelection.nvpKey] : undefined) ?? programAccount?.id;
    const selectedAccount = accountSelection.accounts.find((account) => account.id === selectedAccountID);
    const accountDisplayName = selectedAccount ? `${selectedAccount.label}${isUsingCustomAccount ? '' : ` (${accountSelection.defaultTitleSuffix})`}` : '';

    return {
        isDefaultTitle: !isUsingCustomAccount,
        title: `${accountSelection.exportsToLabel} ${accountDisplayName}`,
        selectedAccountID,
        programAccountID: programAccount?.id,
    };
}

/**
 * The accounting export account a card is mapped to, which is the value the card details page shows in its Accounting
 * section.
 */
function getCardExportAccountTitle(settings: CardExportSettings | undefined, companyCard: Card | undefined): string | undefined {
    return getCardExportAccountSelection(settings, companyCard).title;
}

function getExportMenuItem(
    connectionName: PolicyConnectionName | undefined,
    policyID: string,
    translate: LocaleContextProps['translate'],
    styles: ThemeStyles,
    policy?: Policy,
    companyCard?: Card,
    backTo?: string | undefined,
): ExportIntegration | undefined {
    const settings = getPolicyCardExportSettings(connectionName, policyID, translate, policy, backTo);

    if (!settings) {
        return undefined;
    }

    const {accountSelection, ...menuItem} = settings;
    const selection = getCardExportAccountSelection(settings, companyCard);

    return {
        ...menuItem,
        title: selection.title,
        data: buildExportAccountOptions(accountSelection, selection, styles),
    };
}

/**
 * Builds a back path to company card details using Members when the matching details
 * entry has accountID, otherwise Company Cards, so goBack can match the stack entry.
 */
function getCompanyCardDetailsBackPath(
    policyID: string,
    feed: CompanyCardFeedWithDomainID,
    cardID: string,
    settingsNavigatorState: PlatformStackNavigationState<SettingsNavigatorParamList>,
): Route {
    const decodedFeed = decodeURIComponent(feed);
    const detailsRoute = settingsNavigatorState.routes.findLast((route) => {
        if (route.name !== SCREENS.WORKSPACE.DYNAMIC_COMPANY_CARD_DETAILS) {
            return false;
        }

        const {params} = route;
        if (!params || !('cardID' in params) || !('feed' in params)) {
            return false;
        }

        const routeCardID = params.cardID;
        const routeFeed = params.feed;
        if (typeof routeCardID !== 'string' || typeof routeFeed !== 'string') {
            return false;
        }

        return routeCardID === cardID && decodeURIComponent(routeFeed) === decodedFeed;
    });
    const detailsParams = detailsRoute?.params;
    const accountIDParam = detailsParams && 'accountID' in detailsParams ? detailsParams.accountID : undefined;
    const accountID = typeof accountIDParam === 'string' || typeof accountIDParam === 'number' ? Number(accountIDParam) : undefined;
    const detailsBasePath =
        accountID !== undefined && accountIDParam !== '' && Number.isFinite(accountID) && accountID > 0
            ? ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID)
            : ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(policyID);

    return createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(feed, cardID), detailsBasePath);
}

export {getCardExportAccountTitle, getCompanyCardDetailsBackPath, getExportMenuItem, getPolicyCardExportSettings};
export type {CardExportSettings};
