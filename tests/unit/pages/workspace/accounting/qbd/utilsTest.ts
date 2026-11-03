import getPlatform from '@libs/getPlatform';

import getQuickbooksDesktopSetupEntryRoute, {isQBDExportingOnPayment} from '@pages/workspace/accounting/qbd/utils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Connections} from '@src/types/onyx/Policy';

import {CONST as COMMON_CONST} from 'expensify-common';

import createMock from '../../../../../utils/createMock';

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
    type QBDConfig = Connections['quickbooksDesktop']['config'];

    function buildConfig(accountingMethod?: QBDConfig['export']['accountingMethod']): QBDConfig {
        return createMock<QBDConfig>({export: {accountingMethod}});
    }

    it('is true on cash, where the bill leaves after the reimbursement has run', () => {
        // Given a workspace exporting out-of-pocket expenses on cash
        // When the Advanced page checks whether the fee is ever known at export time
        // Then it is, since the bill leaves after the reimbursement has run
        expect(isQBDExportingOnPayment(buildConfig(COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH))).toBe(true);
    });

    it('is false on accrual, where the bill leaves at approval before the conversion cost is known', () => {
        // Given a workspace exporting out-of-pocket expenses on accrual
        // When the Advanced page checks whether the fee is ever known at export time
        // Then it is not, since the bill leaves at approval before the reimbursement has run
        expect(isQBDExportingOnPayment(buildConfig(COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL))).toBe(false);
    });

    it.each<QBDConfig | undefined>([undefined, createMock<QBDConfig>({})])('defaults to cash when the method is unset (%p), matching the Advanced page', (config) => {
        // Given a workspace that has never picked an accounting method
        // When the Advanced page checks whether the fee is ever known at export time
        // Then it defaults to cash, so the row is shown until an admin says otherwise
        expect(isQBDExportingOnPayment(config)).toBe(true);
    });
});
