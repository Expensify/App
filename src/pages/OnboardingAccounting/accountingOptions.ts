/** Onboarding offers the accounting connectors and waitlist choices listed on workspace Connections. */
import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';

import accountingIntegrationIconNames from '@libs/accountingIntegrationIconNames';
import {getIntegrationWaitlistNames} from '@libs/IntegrationWaitlistUtils';

import CONST from '@src/CONST';
import type {OnboardingAccountingOption} from '@src/CONST';

import type {TupleToUnion} from 'type-fest';

type AccountingOption = {
    name: string;
    iconName: ExpensifyIconName;
    integration: OnboardingAccountingOption;
    connectionName?: TupleToUnion<typeof connectionNames>;
    aliases?: string;
    isComingSoon?: boolean;
    /** The standalone Other choice edits a name instead of saving its translated label. */
    isOther?: boolean;
};

const waitlistNames = [...CONST.POLICY.CONNECTIONS.WAITLIST_CONNECTION_NAMES, ...getIntegrationWaitlistNames()];
const connectionNames = [...CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES, ...waitlistNames];
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
        iconName: accountingIntegrationIconNames[connectionName],
        // Preserve the onboarding API contract for connections without a canonical onboarding answer.
        integration: isOnboardingAccountingOption(connectionName) ? connectionName : 'other',
        aliases: aliases[connectionName],
        isComingSoon: waitlistNames.some((name) => name === connectionName),
    };
    // Connections exposes Intuit Enterprise Suite as a separate choice backed by the QBO connector.
    return connectionName === CONST.POLICY.CONNECTIONS.NAME.QBO
        ? [option, {name: 'Intuit Enterprise Suite', iconName: accountingIntegrationIconNames.intuitEnterpriseSuite, integration: 'intuitEnterpriseSuite', aliases: 'IES'}]
        : [option];
});

export default accountingOptions;
export {isOnboardingAccountingOption};
export type {AccountingOption};
