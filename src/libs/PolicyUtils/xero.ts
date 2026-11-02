/**
 * Xero tenants, the current organization, and bank and expense account options.
 * Extracted from PolicyUtils/index.ts to keep that file smaller.
 */
import type {SelectorType} from '@components/SelectionScreen';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {Account, Tenant} from '@src/types/onyx/Policy';

/**
 * Given a list of admin policies for the current user, checks whether any of them
 * has a Xero accounting software integration configured.
 */
function hasPolicyWithXeroConnection(adminPolicies: Policy[] | undefined) {
    return adminPolicies?.some((policy) => !!policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.XERO]) ?? false;
}

/** Get the Xero organizations connected to the policy */
function getXeroTenants(policy: Policy | undefined): Tenant[] {
    return policy?.connections?.xero?.data?.tenants ?? [];
}

function findCurrentXeroOrganization(tenants: Tenant[] | undefined, organizationID: string | undefined): Tenant | undefined {
    return tenants?.find((tenant) => tenant.id === organizationID);
}

function getCurrentXeroOrganizationName(policy: Policy | undefined): string | undefined {
    return findCurrentXeroOrganization(getXeroTenants(policy), policy?.connections?.xero?.config?.tenantID)?.name;
}

function getXeroBankAccounts(policy: Policy | undefined, selectedBankAccountId: string | undefined): SelectorType[] {
    const bankAccounts = policy?.connections?.xero?.data?.bankAccounts ?? [];

    return (bankAccounts ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedBankAccountId === id,
    }));
}

/** Only profit and loss accounts can take a currency conversion cost, so these are kept apart from the bank accounts. */
function getXeroExpenseAccounts(expenseAccounts: Account[] | undefined, selectedExpenseAccountID: string | undefined): SelectorType[] {
    return (expenseAccounts ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedExpenseAccountID === id,
    }));
}

export {hasPolicyWithXeroConnection, getXeroTenants, findCurrentXeroOrganization, getCurrentXeroOrganizationName, getXeroBankAccounts, getXeroExpenseAccounts};
