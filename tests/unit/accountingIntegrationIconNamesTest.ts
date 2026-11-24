import accountingIntegrationIconNames, {accountingConnectionIconNames} from '@libs/accountingIntegrationIconNames';
import {getIntegrationWaitlistNames} from '@libs/IntegrationWaitlistUtils';

import accountingOptions from '@pages/OnboardingAccounting/accountingOptions';
import {getAccountingIntegrationData} from '@pages/workspace/accounting/utils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {Policy} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

import type {TupleToUnion} from 'type-fest';

import createMock from '../utils/createMock';
import {translateLocal} from '../utils/TestHelper';

const EXISTING_CONNECTIONS = {sageIntacct: false, qbd: false, certinia: false, rillet: false, dualEntry: false, campfire: false};
const icons = createMock<Record<TupleToUnion<typeof accountingConnectionIconNames>, IconAsset>>(Object.fromEntries(accountingConnectionIconNames.map((name) => [name, {uri: name}])));

describe('accountingIntegrationIconNames', () => {
    beforeAll(() => IntlStore.load(CONST.LOCALES.EN));

    it('covers every accounting connection, both waitlist sources, and IES with square artwork', () => {
        // Given the connection identities shared by Connections and onboarding
        const names = [
            ...CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES,
            ...CONST.POLICY.CONNECTIONS.WAITLIST_CONNECTION_NAMES,
            ...getIntegrationWaitlistNames(),
            CONST.POLICY.CONNECTIONS.ACCOUNTING_INTEGRATION_ALIASES.INTUIT_ENTERPRISE_SUITE,
        ];
        // When reading the shared icon metadata
        const iconNames = Object.values(accountingIntegrationIconNames);
        // Then none of the known choices can silently fall back to generic or circular artwork
        expect(new Set(Object.keys(accountingIntegrationIconNames))).toEqual(new Set(names));
        expect(iconNames.every((name) => name.endsWith('Square'))).toBe(true);
        expect(accountingIntegrationIconNames.quickbooksOnline).toBe('QBOSquare');
        expect(accountingIntegrationIconNames.xero).toBe('XeroSquare');
        expect(accountingIntegrationIconNames.intuitEnterpriseSuite).toBe('IntuitSquare');
    });

    it('derives onboarding icons and connector lazy-loading inputs from the shared map', () => {
        // Given all connector, waitlist, and alias artwork from the shared metadata
        const expectedIcons = Object.values(accountingIntegrationIconNames);
        // When their lazy-loading inputs and onboarding choices are built
        const loadedIconNames = accountingConnectionIconNames;
        // Then a shared metadata change reaches both without another icon list update
        expect(loadedIconNames).toEqual(expectedIcons);
        for (const option of accountingOptions) {
            const name = option.connectionName ?? CONST.POLICY.CONNECTIONS.ACCOUNTING_INTEGRATION_ALIASES.INTUIT_ENTERPRISE_SUITE;
            expect(option.iconName).toBe(accountingIntegrationIconNames[name]);
        }
    });

    it.each(CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES)('uses the shared icon when building %s integration data', (name) => {
        // Given the assets loaded from the shared connector icon names
        const expectedIcon = icons[accountingIntegrationIconNames[name]];
        // When building integration data for Connections or its setup flow
        const data = getAccountingIntegrationData(name, 'policy123', translateLocal, EXISTING_CONNECTIONS, {expensifyIcons: icons});
        // Then the connector uses its shared identity rather than its own icon-name literal
        expect(data?.icon).toBe(expectedIcon);
    });

    it.each([true, false])('preserves the explicit IES override %s when choosing QBO artwork', (isIntuitEnterpriseSuiteOverride) => {
        // Given an existing IES connection whose identity can be overridden for a new setup
        const policy = createMock<Policy>({connections: {quickbooksOnline: {config: {credentials: {scope: CONST.POLICY.CONNECTIONS.INTUIT_ENTERPRISE_SUITE_SCOPE}}}}});
        // When explicitly choosing QBO or IES
        const data = getAccountingIntegrationData(CONST.POLICY.CONNECTIONS.NAME.QBO, 'policy123', translateLocal, EXISTING_CONNECTIONS, {
            policy,
            expensifyIcons: icons,
            isIntuitEnterpriseSuiteOverride,
        });
        // Then the alias keeps its own shared artwork without following the old connection
        expect(data?.icon).toBe(icons[isIntuitEnterpriseSuiteOverride ? accountingIntegrationIconNames.intuitEnterpriseSuite : accountingIntegrationIconNames.quickbooksOnline]);
    });

    it('continues to allow building integration data without loaded icons', () => {
        // Given no optional icon assets
        // When building the QBO connection data
        const data = getAccountingIntegrationData(CONST.POLICY.CONNECTIONS.NAME.QBO, 'policy123', translateLocal, EXISTING_CONNECTIONS);
        // Then setup data is still available while its icon remains absent
        expect(data).toBeDefined();
        expect(data?.icon).toBeUndefined();
    });
});
