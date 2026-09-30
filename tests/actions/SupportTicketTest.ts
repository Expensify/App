import * as API from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';

import {openSupportTicket} from '@userActions/Report';

import ROUTES from '@src/ROUTES';

jest.mock('@libs/API');
jest.mock('@libs/Navigation/Navigation');

const mockWrite = jest.mocked(API.write);
const mockNavigate = jest.mocked(Navigation.navigate);
const reportID = 'optimisticSupportTicketReportID';

describe('actions/Report', () => {
    beforeEach(() => {
        jest.spyOn(ReportUtils, 'generateReportID').mockReturnValue(reportID);
        mockWrite.mockClear();
        mockNavigate.mockClear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('navigates to a pending report while the support ticket assignment is in progress', () => {
        openSupportTicket({assigneeAccountID: 123});

        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.CREATE_SUPPORT_TICKET, {reportID, assigneeAccountID: 123});
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, undefined, undefined, undefined, true));
    });
});
