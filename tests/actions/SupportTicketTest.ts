import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import getReportRouteForCurrentContext from '@libs/Navigation/helpers/getReportRouteForCurrentContext';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID} from '@libs/ReportUtils';

import {openSupportTicket} from '@userActions/Report';

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

    it('opens a pending report before a new support ticket request resolves', async () => {
        // When the customer asks to talk to a human
        const request = openSupportTicket();

        // Then the App opens the client-generated report ID while the request is still pending
        expect(mockGenerateReportID).toHaveBeenCalled();
        expect(mockGetReportRouteForCurrentContext).toHaveBeenCalledWith({reportID: newSupportTicketReportID, isPendingCreation: true});
        expect(mockNavigate).toHaveBeenCalledWith(`r/${newSupportTicketReportID}`);
        expect(mockMakeRequestWithSideEffects).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.CREATE_SUPPORT_TICKET, {newSupportTicketReportID});

        await request;

        // And the request does not navigate a second time after the server has created the report
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('sends the resolved ticket ID separately when creating a reassigned support ticket', async () => {
        // Given a resolved support ticket that needs a new assigned rep
        const resolvedSupportTicketReportID = 'resolvedSupportTicketReportID';

        // When the customer creates the reassigned ticket
        const request = openSupportTicket(resolvedSupportTicketReportID);

        // Then the request uses a new client-generated report ID and identifies the old resolved ticket separately
        expect(mockGenerateReportID).toHaveBeenCalled();
        expect(mockGetReportRouteForCurrentContext).toHaveBeenCalledWith({reportID: newSupportTicketReportID, isPendingCreation: true});
        expect(mockNavigate).toHaveBeenCalledWith(`r/${newSupportTicketReportID}`);
        expect(mockMakeRequestWithSideEffects).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.CREATE_SUPPORT_TICKET, {
            newSupportTicketReportID,
            resolvedSupportTicketReportID,
        });

        await request;
    });
});
