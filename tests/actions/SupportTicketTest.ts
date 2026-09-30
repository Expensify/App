import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import getReportRouteForCurrentContext from '@libs/Navigation/helpers/getReportRouteForCurrentContext';
import Navigation from '@libs/Navigation/Navigation';

import {openSupportTicket} from '@userActions/Report';

import CONST from '@src/CONST';

jest.mock('@libs/API');
jest.mock('@libs/Navigation/helpers/getReportRouteForCurrentContext');
jest.mock('@libs/Navigation/Navigation');

const mockMakeRequestWithSideEffects = jest.mocked(API.makeRequestWithSideEffects);
const mockGetReportRouteForCurrentContext = jest.mocked(getReportRouteForCurrentContext);
const mockNavigate = jest.mocked(Navigation.navigate);
const reportID = 'serverGeneratedSupportTicketReportID';

describe('actions/Report', () => {
    beforeEach(() => {
        mockMakeRequestWithSideEffects.mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS, reportID});
        mockGetReportRouteForCurrentContext.mockReturnValue(`r/${reportID}`);
        mockMakeRequestWithSideEffects.mockClear();
        mockGetReportRouteForCurrentContext.mockClear();
        mockNavigate.mockClear();
    });

    it('navigates to the server-created report after the support ticket is assigned', async () => {
        await openSupportTicket({assigneeAccountID: 123});

        expect(mockMakeRequestWithSideEffects).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.CREATE_SUPPORT_TICKET, {assigneeAccountID: 123});
        expect(mockGetReportRouteForCurrentContext).toHaveBeenCalledWith({reportID});
        expect(mockNavigate).toHaveBeenCalledWith(`r/${reportID}`);
    });
});
