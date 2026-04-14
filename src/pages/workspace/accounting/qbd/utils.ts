import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function getQuickbooksDesktopSetupEntryRoute(policyID: string) {
    const platform = getPlatform(true);

    if (platform === CONST.PLATFORM.MOBILE_WEB || platform === CONST.PLATFORM.IOS || platform === CONST.PLATFORM.ANDROID) {
        return ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL.getRoute(policyID);
    }

    return ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_MODAL.getRoute(policyID);
}

export default getQuickbooksDesktopSetupEntryRoute;
