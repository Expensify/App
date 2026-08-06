import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {getAccountingIntegrationDisplayName, getExportIntegrationDisplayName, getQuickbooksOnlineIntegrationName, isIntuitEnterpriseSuiteConnection} from '@libs/AccountingUtils';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

const INTUIT_ENTERPRISE_SUITE_SCOPE = 'app-foundations.custom-dimensions.read';
const translate = ((key: string) => {
    if (key === 'workspace.accounting.intuitEnterpriseSuite') {
        return 'Intuit Enterprise Suite';
    }
    if (key === 'workspace.accounting.qbo') {
        return 'QuickBooks Online';
    }
    return key;
}) as LocaleContextProps['translate'];

function buildQBOConnectionPolicy(scope?: string): Policy {
    if (!scope) {
        return {} as Policy;
    }

    return {
        connections: {
            quickbooksOnline: {
                config: {
                    credentials: {
                        scope,
                    },
                },
            },
        },
    } as Policy;
}

describe('AccountingUtils', () => {
    describe('isIntuitEnterpriseSuiteConnection', () => {
        it('returns true when QBO credentials contain the IES scope', () => {
            const policy = buildQBOConnectionPolicy(`com.intuit.quickbooks.accounting ${INTUIT_ENTERPRISE_SUITE_SCOPE}`);

            expect(isIntuitEnterpriseSuiteConnection(policy)).toBe(true);
        });

        it('returns false when the IES scope or QBO connection is missing', () => {
            expect(isIntuitEnterpriseSuiteConnection(buildQBOConnectionPolicy('com.intuit.quickbooks.accounting'))).toBe(false);
            expect(isIntuitEnterpriseSuiteConnection(buildQBOConnectionPolicy())).toBe(false);
            expect(isIntuitEnterpriseSuiteConnection(undefined)).toBe(false);
        });
    });

    describe('getQuickbooksOnlineIntegrationName', () => {
        it('returns the IES name for an IES connection', () => {
            expect(getQuickbooksOnlineIntegrationName(buildQBOConnectionPolicy(INTUIT_ENTERPRISE_SUITE_SCOPE), translate)).toBe('Intuit Enterprise Suite');
        });

        it('returns the QBO name for a standard QBO connection', () => {
            expect(getQuickbooksOnlineIntegrationName(buildQBOConnectionPolicy('com.intuit.quickbooks.accounting'), translate)).toBe('QuickBooks Online');
        });
    });

    describe('getAccountingIntegrationDisplayName', () => {
        it('returns the IES name for an IES-backed QBO connection', () => {
            expect(getAccountingIntegrationDisplayName(buildQBOConnectionPolicy(INTUIT_ENTERPRISE_SUITE_SCOPE), CONST.POLICY.CONNECTIONS.NAME.QBO, translate)).toBe(
                'Intuit Enterprise Suite',
            );
        });

        it('returns the QBO name for a standard QBO connection', () => {
            expect(getAccountingIntegrationDisplayName(buildQBOConnectionPolicy('com.intuit.quickbooks.accounting'), CONST.POLICY.CONNECTIONS.NAME.QBO, translate)).toBe('QuickBooks Online');
        });

        it('returns the canonical friendly name for another integration', () => {
            expect(getAccountingIntegrationDisplayName(buildQBOConnectionPolicy(INTUIT_ENTERPRISE_SUITE_SCOPE), CONST.POLICY.CONNECTIONS.NAME.XERO, translate)).toBe('Xero');
        });
    });

    describe('getExportIntegrationDisplayName', () => {
        it('returns the IES name for the QBO export label in an IES workspace', () => {
            expect(getExportIntegrationDisplayName(buildQBOConnectionPolicy(INTUIT_ENTERPRISE_SUITE_SCOPE), CONST.EXPORT_LABELS.QBO, translate)).toBe('Intuit Enterprise Suite');
        });

        it('keeps the QBO export label for a standard QBO workspace', () => {
            expect(getExportIntegrationDisplayName(buildQBOConnectionPolicy('com.intuit.quickbooks.accounting'), CONST.EXPORT_LABELS.QBO, translate)).toBe(CONST.EXPORT_LABELS.QBO);
        });

        it('keeps other and missing export labels unchanged', () => {
            const policy = buildQBOConnectionPolicy(INTUIT_ENTERPRISE_SUITE_SCOPE);

            expect(getExportIntegrationDisplayName(policy, CONST.EXPORT_LABELS.XERO, translate)).toBe(CONST.EXPORT_LABELS.XERO);
            expect(getExportIntegrationDisplayName(policy, undefined, translate)).toBeUndefined();
        });
    });
});
