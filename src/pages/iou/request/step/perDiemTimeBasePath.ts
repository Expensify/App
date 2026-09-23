import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';

import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type PerDiemTimeBasePathParams = {
    /** The per diem draft transaction, used to tell a global-create flow from a report-started one */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Route params shared by every per diem step */
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    transactionID: string;
    reportID: string;
    backToReport?: string;

    /** Whether more than one policy with per diem enabled is active (the flow then goes through the destination step) */
    hasMoreThanOnePolicyWithPerDiemEnabled: boolean;
};

export default function buildPerDiemTimeBasePath({transaction, action, iouType, transactionID, reportID, backToReport, hasMoreThanOnePolicyWithPerDiemEnabled}: PerDiemTimeBasePathParams) {
    if (!(transaction?.isFromGlobalCreate || iouType === CONST.IOU.TYPE.TRACK)) {
        return ROUTES.MONEY_REQUEST_CREATE_TAB_PER_DIEM.getRoute(action, iouType, transactionID, reportID, backToReport);
    }
    if (!hasMoreThanOnePolicyWithPerDiemEnabled) {
        return ROUTES.MONEY_REQUEST_CREATE.getRoute(action, iouType, transactionID, reportID, backToReport);
    }
    return createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_DESTINATION.path, ROUTES.MONEY_REQUEST_CREATE.getRoute(action, iouType, transactionID, reportID, backToReport));
}
