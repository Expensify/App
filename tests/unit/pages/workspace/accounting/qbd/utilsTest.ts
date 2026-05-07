import getPlatform from '@libs/getPlatform';
import getQuickbooksDesktopSetupEntryRoute from '@pages/workspace/accounting/qbd/utils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

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
