import {
    getAccountingIntegrationDisplayName,
    getExportLabelForConnection,
    getExportLabelsForConnection,
    getQBORefreshTokenExpiryDate,
    getQBORefreshTokenExpiryStatus,
    getQuickbooksOnlineIntegrationName,
    isIntuitEnterpriseSuiteConnection,
    isQBORefreshTokenExpiringSoon,
} from '@libs/AccountingUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {Policy} from '@src/types/onyx';

import {addDays, getUnixTime, subDays} from 'date-fns';

import createMock from '../utils/createMock';
import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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

function buildQBOPolicyWithRefreshTokenExpiry(refreshTokenExpiresAt: number, isAuthenticationError = false): Policy {
    return createMock<Policy>({
        connections: {
            quickbooksOnline: {
                config: {
                    credentials: {
                        companyID: '12345',
                        refreshTokenExpiresAt,
                    },
                },
                lastSync: {
                    isAuthenticationError,
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

    describe('getQBORefreshTokenExpiryDate', () => {
        it('converts the stored epoch seconds into a date', () => {
            const expiry = addDays(new Date(), 10);

            expect(getQBORefreshTokenExpiryDate(buildQBOPolicyWithRefreshTokenExpiry(getUnixTime(expiry)))?.getTime()).toBe(Math.floor(expiry.getTime() / 1000) * 1000);
        });

        it('returns undefined when the connection or the expiry is missing', () => {
            expect(getQBORefreshTokenExpiryDate(buildQBOConnectionPolicy('com.intuit.quickbooks.accounting'))).toBeUndefined();
            expect(getQBORefreshTokenExpiryDate(buildQBOConnectionPolicy())).toBeUndefined();
            expect(getQBORefreshTokenExpiryDate(undefined)).toBeUndefined();
        });
    });

    describe('getQBORefreshTokenExpiryStatus', () => {
        const now = new Date('2026-09-15T12:00:00Z');

        it('reports a token inside the warning window as expiring soon', () => {
            expect(getQBORefreshTokenExpiryStatus(buildQBOPolicyWithRefreshTokenExpiry(getUnixTime(addDays(now, 3))), now)).toBe(
                CONST.POLICY.CONNECTIONS.QBO_REFRESH_TOKEN_EXPIRY_STATUS.EXPIRING_SOON,
            );
        });

        it('reports a token past its expiry as expired', () => {
            expect(getQBORefreshTokenExpiryStatus(buildQBOPolicyWithRefreshTokenExpiry(getUnixTime(subDays(now, 1))), now)).toBe(
                CONST.POLICY.CONNECTIONS.QBO_REFRESH_TOKEN_EXPIRY_STATUS.EXPIRED,
            );
        });

        it('reports nothing for a healthy token or a connection that already failed to authenticate', () => {
            expect(getQBORefreshTokenExpiryStatus(buildQBOPolicyWithRefreshTokenExpiry(getUnixTime(addDays(now, 90))), now)).toBeUndefined();
            expect(getQBORefreshTokenExpiryStatus(buildQBOPolicyWithRefreshTokenExpiry(getUnixTime(addDays(now, 3)), true), now)).toBeUndefined();
        });
    });

    describe('isQBORefreshTokenExpiringSoon', () => {
        const now = new Date('2026-09-15T12:00:00Z');

        it('returns true when the refresh token expires within the warning window', () => {
            expect(isQBORefreshTokenExpiringSoon(buildQBOPolicyWithRefreshTokenExpiry(getUnixTime(addDays(now, 3))), now)).toBe(true);
            expect(isQBORefreshTokenExpiringSoon(buildQBOPolicyWithRefreshTokenExpiry(getUnixTime(addDays(now, CONST.POLICY.CONNECTIONS.QBO_REFRESH_TOKEN_EXPIRY_WARNING_DAYS))), now)).toBe(
                true,
            );
        });

        it('returns true when the refresh token has already expired without a sync failing yet', () => {
            expect(isQBORefreshTokenExpiringSoon(buildQBOPolicyWithRefreshTokenExpiry(getUnixTime(subDays(now, 1))), now)).toBe(true);
        });

        it('returns false while the refresh token is still far from expiring', () => {
            expect(
                isQBORefreshTokenExpiringSoon(buildQBOPolicyWithRefreshTokenExpiry(getUnixTime(addDays(now, CONST.POLICY.CONNECTIONS.QBO_REFRESH_TOKEN_EXPIRY_WARNING_DAYS + 1))), now),
            ).toBe(false);
            expect(isQBORefreshTokenExpiringSoon(buildQBOPolicyWithRefreshTokenExpiry(getUnixTime(addDays(now, 90))), now)).toBe(false);
        });

        it('returns false when the connection already reports an authentication error', () => {
            expect(isQBORefreshTokenExpiringSoon(buildQBOPolicyWithRefreshTokenExpiry(getUnixTime(addDays(now, 3)), true), now)).toBe(false);
        });

        it('returns false when there is no expiry to compare against', () => {
            expect(isQBORefreshTokenExpiringSoon(buildQBOConnectionPolicy('com.intuit.quickbooks.accounting'), now)).toBe(false);
            expect(isQBORefreshTokenExpiringSoon(undefined, now)).toBe(false);
        });
    });

    describe('isIntuitEnterpriseSuiteConnection', () => {
        it('returns true when QBO credentials contain the IES scope', () => {
            const policy = buildQBOConnectionPolicy(`com.intuit.quickbooks.accounting ${CONST.POLICY.CONNECTIONS.INTUIT_ENTERPRISE_SUITE_SCOPE}`);

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
            expect(getQuickbooksOnlineIntegrationName(buildQBOConnectionPolicy(CONST.POLICY.CONNECTIONS.INTUIT_ENTERPRISE_SUITE_SCOPE), translateLocal)).toBe('Intuit Enterprise Suite');
        });

        it('returns the QBO name for a standard QBO connection', () => {
            expect(getQuickbooksOnlineIntegrationName(buildQBOConnectionPolicy('com.intuit.quickbooks.accounting'), translateLocal)).toBe('QuickBooks Online');
        });
    });

    describe('getAccountingIntegrationDisplayName', () => {
        it('returns the IES name for an IES-backed QBO connection', () => {
            expect(
                getAccountingIntegrationDisplayName(buildQBOConnectionPolicy(CONST.POLICY.CONNECTIONS.INTUIT_ENTERPRISE_SUITE_SCOPE), CONST.POLICY.CONNECTIONS.NAME.QBO, translateLocal),
            ).toBe('Intuit Enterprise Suite');
        });

        it('returns the QBO name for a standard QBO connection', () => {
            expect(getAccountingIntegrationDisplayName(buildQBOConnectionPolicy('com.intuit.quickbooks.accounting'), CONST.POLICY.CONNECTIONS.NAME.QBO, translateLocal)).toBe(
                'QuickBooks Online',
            );
        });

        it('returns the canonical friendly name for another integration', () => {
            expect(
                getAccountingIntegrationDisplayName(buildQBOConnectionPolicy(CONST.POLICY.CONNECTIONS.INTUIT_ENTERPRISE_SUITE_SCOPE), CONST.POLICY.CONNECTIONS.NAME.XERO, translateLocal),
            ).toBe('Xero');
        });
    });

    describe('getExportLabelForConnection', () => {
        it('returns the IES label for an IES-backed QBO connection', () => {
            expect(getExportLabelForConnection(CONST.POLICY.CONNECTIONS.NAME.QBO, buildQBOConnectionPolicy(CONST.POLICY.CONNECTIONS.INTUIT_ENTERPRISE_SUITE_SCOPE))).toBe(
                CONST.EXPORT_LABELS.INTUIT_ENTERPRISE_SUITE,
            );
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
                    buildQBOConnectionPolicy(CONST.POLICY.CONNECTIONS.INTUIT_ENTERPRISE_SUITE_SCOPE),
                ]),
            ).toEqual([CONST.EXPORT_LABELS.QBO, CONST.EXPORT_LABELS.INTUIT_ENTERPRISE_SUITE]);
        });
    });
});
