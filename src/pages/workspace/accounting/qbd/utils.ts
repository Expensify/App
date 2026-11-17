import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Connections} from '@src/types/onyx/Policy';

import {CONST as COMMON_CONST} from 'expensify-common';

function getQuickbooksDesktopSetupEntryRoute(policyID: string) {
    const platform = getPlatform(true);

    if (platform === CONST.PLATFORM.MOBILE_WEB || platform === CONST.PLATFORM.IOS || platform === CONST.PLATFORM.ANDROID) {
        return ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL.getRoute(policyID);
    }

    return ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_MODAL.getRoute(policyID);
}

/**
 * Whether out-of-pocket expenses export after they are paid. The currency conversion cost rides on the bill and is
 * only known once the reimbursement has run, so an accrual export at approval can never carry it.
 */
function isQBDExportingOnPayment(config: Connections['quickbooksDesktop']['config'] | undefined) {
    return (config?.export?.accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH) === COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH;
}

export {isQBDExportingOnPayment};
export default getQuickbooksDesktopSetupEntryRoute;
