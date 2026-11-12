import {WRITE_COMMANDS} from '@libs/API/types';
import type {Middleware} from '@libs/Request';

import {getCurrentUserAccountIDFromSession} from '@userActions/IOU';
import {openReport} from '@userActions/Report';

import CONST from '@src/CONST';

const EXPENSE_CREATE_COMMANDS = new Set<string>([WRITE_COMMANDS.REQUEST_MONEY, WRITE_COMMANDS.TRACK_EXPENSE]);

const refreshReportOnRejectedExpense: Middleware = (requestResponse, request) =>
    requestResponse.then((response) => {
        const reportID = request.data?.iouReportID;
        if (
            response?.jsonCode !== CONST.JSON_CODE.EXP_ERROR ||
            !EXPENSE_CREATE_COMMANDS.has(request.command) ||
            !!request.data?.createdIOUReportActionID ||
            typeof reportID !== 'string' ||
            !reportID
        ) {
            return response;
        }

        openReport({
            reportID,
            introSelected: undefined,
            conciergeChat: undefined,
            personalDetails: undefined,
            hasReportActions: true,
            currentUserAccountID: getCurrentUserAccountIDFromSession(),
            shouldMarkAsRead: false,
        });

        return response;
    });

export default refreshReportOnRejectedExpense;
