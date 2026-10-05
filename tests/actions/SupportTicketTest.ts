import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import getReportRouteForCurrentContext from '@libs/Navigation/helpers/getReportRouteForCurrentContext';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID} from '@libs/ReportUtils';

import {isNoSupportRepAvailableResponse, openSupportTicket} from '@userActions/Report';

import CONST from '@src/CONST';

jest.mock('@libs/API');
jest.mock('@libs/Navigation/helpers/getReportRouteForCurrentContext');
jest.mock('@libs/Navigation/Navigation');
jest.mock('@libs/ReportUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/ReportUtils'),
    generateReportID: jest.fn(),
}));

const mockMakeRequestWithSideEffects = jest.mocked(API.makeRequestWithSideEffects);
const mockGetReportRouteForCurrentContext = jest.mocked(getReportRouteForCurrentContext);
const mockNavigate = jest.mocked(Navigation.navigate);
const mockGenerateReportID = jest.mocked(generateReportID);
const newSupportTicketReportID = 'optimisticSupportTicketReportID';

describe('actions/Report', () => {
    beforeEach(() => {
        mockMakeRequestWithSideEffects.mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS});
        mockGetReportRouteForCurrentContext.mockReturnValue(`r/${newSupportTicketReportID}`);
        mockGenerateReportID.mockReturnValue(newSupportTicketReportID);
        mockMakeRequestWithSideEffects.mockClear();
        mockGetReportRouteForCurrentContext.mockClear();
        mockGenerateReportID.mockClear();
        mockNavigate.mockClear();
    });

    it.each([
        ['a new support ticket', undefined, {newSupportTicketReportID}],
        ['a reassigned support ticket', 'resolvedSupportTicketReportID', {newSupportTicketReportID, resolvedSupportTicketReportID: 'resolvedSupportTicketReportID'}],
    ])('opens a pending report and sends the expected payload for %s', async (_scenario, resolvedSupportTicketReportID, parameters) => {
        // Given a request for a new or reassigned support ticket
        // When the customer asks to talk to a human
        const request = openSupportTicket(resolvedSupportTicketReportID);

        // Then the App opens the client-generated report ID while the request is still pending
        expect(mockGenerateReportID).toHaveBeenCalled();
        expect(mockGetReportRouteForCurrentContext).toHaveBeenCalledWith({reportID: newSupportTicketReportID, isPendingCreation: true});
        expect(mockNavigate).toHaveBeenCalledWith(`r/${newSupportTicketReportID}`);
        expect(mockMakeRequestWithSideEffects).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.CREATE_SUPPORT_TICKET, parameters);

        await request;

        // And the request does not navigate a second time after the server has created the report
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('recognizes the no-rep response', () => {
        // Given the exact error returned when the backend cannot assign a support rep
        const response = {jsonCode: CONST.JSON_CODE.EXP_ERROR, message: 'No support rep is available to take this ticket.'};

        // Then the App can show the Concierge fallback instead of leaving the pending ticket open
        expect(isNoSupportRepAvailableResponse(response)).toBe(true);
    });

    it.each([
        {jsonCode: CONST.JSON_CODE.EXP_ERROR, message: 'We could not create this support ticket.'},
        {jsonCode: CONST.JSON_CODE.BAD_REQUEST, message: 'No support rep is available to take this ticket.'},
        {jsonCode: CONST.JSON_CODE.EXP_ERROR, message: undefined},
    ])('does not mistake other failures for the no-rep response', (response) => {
        expect(isNoSupportRepAvailableResponse(response)).toBe(false);
    });
});
