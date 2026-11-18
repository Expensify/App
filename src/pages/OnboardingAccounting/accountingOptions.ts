/** Onboarding offers the accounting connectors and waitlist choices listed on workspace Connections. */
import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';

import {getIntegrationWaitlistNames} from '@libs/IntegrationWaitlistUtils';

import CONST from '@src/CONST';
import type {OnboardingAccountingOption} from '@src/CONST';

import type {TupleToUnion} from 'type-fest';

type AccountingOption = {
    name: string;
    iconName: ExpensifyIconName;
    integration: OnboardingAccountingOption;
    connectionName?: string;
    aliases?: string;
    isComingSoon?: boolean;
};

const waitlistNames = [...CONST.POLICY.CONNECTIONS.WAITLIST_CONNECTION_NAMES, ...getIntegrationWaitlistNames()];
const connectionNames = [...CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES, ...waitlistNames];
const iconNames: Partial<Record<TupleToUnion<typeof connectionNames>, ExpensifyIconName>> = {
    quickbooksOnline: 'QBOCircle',
    quickbooksDesktop: 'QBDSquare',
    xero: 'XeroCircle',
    netsuite: 'NetSuiteSquare',
    intacct: 'IntacctSquare',
    financialforce: 'CertiniaSquare',
    rillet: 'RilletSquare',
    dualEntry: 'DualEntrySquare',
    campfire: 'CampfireSquare',
    digits: 'DigitsSquare',
    zohoBooks: 'ZohoBooksSquare',
    businessCentral: 'BusinessCentralSquare',
    sageAccounting: 'IntacctSquare',
    odoo: 'OdooSquare',
    exactOnline: 'ExactOnlineSquare',
};
const aliases: Partial<Record<TupleToUnion<typeof connectionNames>, string>> = {
    quickbooksOnline: 'QBO',
    quickbooksDesktop: 'QBD',
    financialforce: 'FinancialForce',
};

function isOnboardingAccountingOption(name: string): name is OnboardingAccountingOption {
    return Object.hasOwn(CONST.ONBOARDING_ACCOUNTING_MAPPING, name);
}

const accountingOptions: AccountingOption[] = connectionNames.flatMap((connectionName): AccountingOption[] => {
    const option: AccountingOption = {
        connectionName,
        name: CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName],
        iconName: iconNames[connectionName] ?? 'Building',
        // Preserve the onboarding API contract for connections without a canonical onboarding answer.
        integration: isOnboardingAccountingOption(connectionName) ? connectionName : 'other',
        aliases: aliases[connectionName],
        isComingSoon: waitlistNames.some((name) => name === connectionName),
    };
    // Connections exposes Intuit Enterprise Suite as a separate choice backed by the QBO connector.
    return connectionName === CONST.POLICY.CONNECTIONS.NAME.QBO
        ? [option, {name: 'Intuit Enterprise Suite', iconName: 'IntuitSquare', integration: 'intuitEnterpriseSuite', aliases: 'IES'}]
        : [option];
});

export default accountingOptions;
export {isOnboardingAccountingOption};
export type {AccountingOption};
