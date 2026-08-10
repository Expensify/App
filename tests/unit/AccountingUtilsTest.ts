import {
    getAccountingIntegrationDisplayName,
    getExportIntegrationDisplayName,
    getExportLabelForConnection,
    getExportLabelsForConnection,
    getQuickbooksOnlineIntegrationName,
    isIntuitEnterpriseSuiteConnection,
} from '@libs/AccountingUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {Policy} from '@src/types/onyx';

import createMock from '../utils/createMock';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const INTUIT_ENTERPRISE_SUITE_SCOPE = 'app-foundations.custom-dimensions.read';

function buildQBOConnectionPolicy(scope?: string): Policy {
    if (!scope) {
        return createMock<Policy>({});
    }

    return createMock<Policy>({
        connections: {
            quickbooksOnline: {
                config: {
                    credentials: {
                        scope,
                    },
                },
            },
        },
    });
}

describe('AccountingUtils', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.DEFAULT);
        return waitForBatchedUpdates();
    });

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
            expect(getQuickbooksOnlineIntegrationName(buildQBOConnectionPolicy(INTUIT_ENTERPRISE_SUITE_SCOPE), translateLocal)).toBe('Intuit Enterprise Suite');
        });

        it('returns the QBO name for a standard QBO connection', () => {
            expect(getQuickbooksOnlineIntegrationName(buildQBOConnectionPolicy('com.intuit.quickbooks.accounting'), translateLocal)).toBe('QuickBooks Online');
        });
    });

    describe('getAccountingIntegrationDisplayName', () => {
        it('returns the IES name for an IES-backed QBO connection', () => {
            expect(getAccountingIntegrationDisplayName(buildQBOConnectionPolicy(INTUIT_ENTERPRISE_SUITE_SCOPE), CONST.POLICY.CONNECTIONS.NAME.QBO, translateLocal)).toBe(
                'Intuit Enterprise Suite',
            );
        });

        it('returns the QBO name for a standard QBO connection', () => {
            expect(getAccountingIntegrationDisplayName(buildQBOConnectionPolicy('com.intuit.quickbooks.accounting'), CONST.POLICY.CONNECTIONS.NAME.QBO, translateLocal)).toBe(
                'QuickBooks Online',
            );
        });

        it('returns the canonical friendly name for another integration', () => {
            expect(getAccountingIntegrationDisplayName(buildQBOConnectionPolicy(INTUIT_ENTERPRISE_SUITE_SCOPE), CONST.POLICY.CONNECTIONS.NAME.XERO, translateLocal)).toBe('Xero');
        });
    });

    describe('getExportLabelForConnection', () => {
        it('returns the IES label for an IES-backed QBO connection', () => {
            expect(getExportLabelForConnection(CONST.POLICY.CONNECTIONS.NAME.QBO, buildQBOConnectionPolicy(INTUIT_ENTERPRISE_SUITE_SCOPE))).toBe(CONST.EXPORT_LABELS.INTUIT_ENTERPRISE_SUITE);
        });

        it('returns the QBO label for a standard QBO connection', () => {
            expect(getExportLabelForConnection(CONST.POLICY.CONNECTIONS.NAME.QBO, buildQBOConnectionPolicy('com.intuit.quickbooks.accounting'))).toBe(CONST.EXPORT_LABELS.QBO);
        });
    });

    describe('getExportLabelsForConnection', () => {
        it('returns distinct labels for standard QBO and IES policies', () => {
            expect(
                getExportLabelsForConnection(CONST.POLICY.CONNECTIONS.NAME.QBO, [
                    buildQBOConnectionPolicy('com.intuit.quickbooks.accounting'),
                    buildQBOConnectionPolicy(INTUIT_ENTERPRISE_SUITE_SCOPE),
                ]),
            ).toEqual([CONST.EXPORT_LABELS.QBO, CONST.EXPORT_LABELS.INTUIT_ENTERPRISE_SUITE]);
        });
    });

    describe('getExportIntegrationDisplayName', () => {
        it('returns the IES name for the QBO export label in an IES workspace', () => {
            expect(getExportIntegrationDisplayName(buildQBOConnectionPolicy(INTUIT_ENTERPRISE_SUITE_SCOPE), CONST.EXPORT_LABELS.QBO, translateLocal)).toBe('Intuit Enterprise Suite');
        });

        it('keeps the QBO export label for a standard QBO workspace', () => {
            expect(getExportIntegrationDisplayName(buildQBOConnectionPolicy('com.intuit.quickbooks.accounting'), CONST.EXPORT_LABELS.QBO, translateLocal)).toBe(CONST.EXPORT_LABELS.QBO);
        });

        it('keeps other and missing export labels unchanged', () => {
            const policy = buildQBOConnectionPolicy(INTUIT_ENTERPRISE_SUITE_SCOPE);

            expect(getExportIntegrationDisplayName(policy, CONST.EXPORT_LABELS.XERO, translateLocal)).toBe(CONST.EXPORT_LABELS.XERO);
            expect(getExportIntegrationDisplayName(policy, undefined, translateLocal)).toBeUndefined();
        });
    });
});
