/** Shared square artwork for accounting connectors, waitlist choices, and the IES alias. */
import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';

import type CONST from '@src/CONST';

import type {TupleToUnion} from 'type-fest';

import type {WaitlistIntegration} from './IntegrationWaitlistUtils';

type AccountingIntegrationName =
    | TupleToUnion<typeof CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES>
    | TupleToUnion<typeof CONST.POLICY.CONNECTIONS.WAITLIST_CONNECTION_NAMES>
    | WaitlistIntegration
    | typeof CONST.POLICY.CONNECTIONS.ACCOUNTING_INTEGRATION_ALIASES.INTUIT_ENTERPRISE_SUITE;

const accountingIntegrationIconNames = {
    quickbooksOnline: 'QBOSquare',
    quickbooksDesktop: 'QBDSquare',
    xero: 'XeroSquare',
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
    intuitEnterpriseSuite: 'IntuitSquare',
} as const satisfies Record<AccountingIntegrationName, ExpensifyIconName>;

const accountingConnectionIconNames = Object.values(accountingIntegrationIconNames);

export default accountingIntegrationIconNames;
export {accountingConnectionIconNames};
