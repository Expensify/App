import getPlatform from '@libs/getPlatform';

import getQuickbooksDesktopSetupEntryRoute, {isQBDExportingOnPayment} from '@pages/workspace/accounting/qbd/utils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Connections} from '@src/types/onyx/Policy';

import {CONST as COMMON_CONST} from 'expensify-common';

jest.mock('@libs/getPlatform', () => jest.fn());

const mockedGetPlatform = jest.mocked(getPlatform);

describe('getQuickbooksDesktopSetupEntryRoute', () => {
    const policyID = '123';

    it('returns the setup page route on desktop web', () => {
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);

        expect(getQuickbooksDesktopSetupEntryRoute(policyID)).toBe(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_MODAL.getRoute(policyID));
    });

    it.each([CONST.PLATFORM.MOBILE_WEB, CONST.PLATFORM.IOS, CONST.PLATFORM.ANDROID])('returns the required device route on %s', (platform) => {
        mockedGetPlatform.mockReturnValue(platform);

        expect(getQuickbooksDesktopSetupEntryRoute(policyID)).toBe(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL.getRoute(policyID));
    });
});

describe('isQBDExportingOnPayment', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const buildConfig = (accountingMethod?: string) => ({export: {accountingMethod}}) as unknown as Connections['quickbooksDesktop']['config'];

    it('is true on cash, where the bill leaves after the reimbursement has run', () => {
        expect(isQBDExportingOnPayment(buildConfig(COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH))).toBe(true);
    });

    it('is false on accrual, where the bill leaves at approval before the conversion cost is known', () => {
        expect(isQBDExportingOnPayment(buildConfig(COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL))).toBe(false);
    });

    it.each([[undefined], [{}]])('defaults to cash when the method is unset (%p), matching the Advanced page', (config) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        expect(isQBDExportingOnPayment(config as unknown as Connections['quickbooksDesktop']['config'])).toBe(true);
    });
});
