import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import getReportRouteForCurrentContext from '@libs/Navigation/helpers/getReportRouteForCurrentContext';
import Navigation from '@libs/Navigation/Navigation';
import {generateReportID} from '@libs/ReportUtils';

import {isNoSupportRepAvailableResponse, openSupportTicket} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        mockMakeRequestWithSideEffects.mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS});
        mockGetReportRouteForCurrentContext.mockReturnValue(`r/${newSupportTicketReportID}`);
        mockGenerateReportID.mockReturnValue(newSupportTicketReportID);
        mockMakeRequestWithSideEffects.mockClear();
        mockGetReportRouteForCurrentContext.mockClear();
        mockGenerateReportID.mockClear();
        mockNavigate.mockClear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('opens a pending report and sends the expected payload for a new support ticket', async () => {
        // Given a request for a new support ticket
        // When the customer asks to talk to a human
        const request = openSupportTicket();

        // Then the App opens the client-generated report ID while the request is still pending
        expect(mockGenerateReportID).toHaveBeenCalled();
        expect(mockGetReportRouteForCurrentContext).toHaveBeenCalledWith({reportID: newSupportTicketReportID, isPendingCreation: true});
        expect(mockNavigate).toHaveBeenCalledWith(`r/${newSupportTicketReportID}`);
        expect(mockMakeRequestWithSideEffects).toHaveBeenCalledWith(
            SIDE_EFFECT_REQUEST_COMMANDS.CREATE_SUPPORT_TICKET,
            {newSupportTicketReportID},
            {
                optimisticData: [
                    {
                        onyxMethod: Onyx.METHOD.SET,
                        key: `${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${newSupportTicketReportID}`,
                        value: {isCreatingSupportTicket: true},
                    },
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${newSupportTicketReportID}`,
                        value: {reportID: newSupportTicketReportID, type: CONST.REPORT.TYPE.SUPPORT_TICKET},
                    },
                ],
                successData: [
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${newSupportTicketReportID}`,
                        value: {isCreatingSupportTicket: false},
                    },
                ],
                failureData: [
                    {
                        onyxMethod: Onyx.METHOD.SET,
                        key: `${ONYXKEYS.COLLECTION.REPORT}${newSupportTicketReportID}`,
                        value: null,
                    },
                    {
                        onyxMethod: Onyx.METHOD.SET,
                        key: `${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${newSupportTicketReportID}`,
                        value: null,
                    },
                ],
            },
        );
        const requestCallOrder = mockMakeRequestWithSideEffects.mock.invocationCallOrder.at(0) ?? Number.MAX_SAFE_INTEGER;
        const navigationCallOrder = mockNavigate.mock.invocationCallOrder.at(0) ?? Number.MIN_SAFE_INTEGER;
        expect(requestCallOrder).toBeLessThan(navigationCallOrder);

        await request;

        // And the request does not navigate a second time after the server has created the report
        expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('marks a new ticket optimistic before publishing its report ID', async () => {
        // Given a screen observing a ticket that has not been created on the server
        let isCreatingSupportTicket = false;
        const reportStates: boolean[] = [];
        // Observe both keys independently, as the report screen does while creation is pending.
        const loadingStateConnection = Onyx.connectWithoutView({
            key: `${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${newSupportTicketReportID}`,
            callback: (loadingState) => {
                isCreatingSupportTicket = !!loadingState?.isCreatingSupportTicket;
            },
        });
        const reportConnection = Onyx.connectWithoutView({
            key: `${ONYXKEYS.COLLECTION.REPORT}${newSupportTicketReportID}`,
            callback: (report) => {
                if (!report?.reportID) {
                    return;
                }
                reportStates.push(isCreatingSupportTicket);
            },
        });
        await waitForBatchedUpdates();
        mockMakeRequestWithSideEffects.mockImplementationOnce(async (_command, _parameters, onyxData) => {
            await Onyx.update(onyxData?.optimisticData ?? []);
        });

        try {
            // When optimistic updates make the pending ticket visible
            await openSupportTicket();
            await waitForBatchedUpdates();

            // Then the report ID is never observable without its fetch guard
            expect(reportStates).toEqual([true]);
        } finally {
            Onyx.disconnect(reportConnection);
            Onyx.disconnect(loadingStateConnection);
        }
    });

    it('removes the pending report when the request fails before receiving a response', async () => {
        // Given an optimistic support ticket in Onyx and a request that fails before the API can apply its failure data
        const networkError = new Error('Network request failed');
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${newSupportTicketReportID}`, {
            reportID: newSupportTicketReportID,
            type: CONST.REPORT.TYPE.SUPPORT_TICKET,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${newSupportTicketReportID}`, {isCreatingSupportTicket: true});
        mockMakeRequestWithSideEffects.mockRejectedValueOnce(networkError);

        // When the customer asks to talk to a human
        const request = openSupportTicket();

        // Then the App removes the pending report and preserves the request failure
        await expect(request).rejects.toBe(networkError);
        await expect(getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${newSupportTicketReportID}`)).resolves.toBeUndefined();
        await expect(getOnyxValue(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${newSupportTicketReportID}`)).resolves.toBeUndefined();
    });

    it('keeps the report and releases its fetch guard after creation succeeds', async () => {
        // Given a new ticket whose server response applies the API's success updates
        mockMakeRequestWithSideEffects.mockImplementationOnce(async (_command, _parameters, onyxData) => {
            await Onyx.update(onyxData?.optimisticData ?? []);
            await expect(getOnyxValue(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${newSupportTicketReportID}`)).resolves.toEqual({isCreatingSupportTicket: true});
            await Onyx.update(onyxData?.successData ?? []);
            return {jsonCode: CONST.JSON_CODE.SUCCESS};
        });

        // When the server accepts the creation request
        await openSupportTicket();

        // Then the ticket remains available and can be fetched
        await expect(getOnyxValue(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${newSupportTicketReportID}`)).resolves.toEqual({isCreatingSupportTicket: false});
        await expect(getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${newSupportTicketReportID}`)).resolves.toEqual({
            reportID: newSupportTicketReportID,
            type: CONST.REPORT.TYPE.SUPPORT_TICKET,
        });
        await expect(getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${newSupportTicketReportID}`)).resolves.toBeUndefined();
    });

    it('removes the pending report and loading state when the server rejects creation', async () => {
        // Given a new ticket whose server response applies the API's failure updates
        mockMakeRequestWithSideEffects.mockImplementationOnce(async (_command, _parameters, onyxData) => {
            await Onyx.update(onyxData?.optimisticData ?? []);
            await expect(getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${newSupportTicketReportID}`)).resolves.toEqual({
                reportID: newSupportTicketReportID,
                type: CONST.REPORT.TYPE.SUPPORT_TICKET,
            });
            await expect(getOnyxValue(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${newSupportTicketReportID}`)).resolves.toEqual({isCreatingSupportTicket: true});
            await Onyx.update(onyxData?.failureData ?? []);
            return {jsonCode: CONST.JSON_CODE.EXP_ERROR};
        });

        // When the server rejects the creation request
        await openSupportTicket();

        // Then neither the pending ticket nor its fetch guard remains
        await expect(getOnyxValue(`${ONYXKEYS.COLLECTION.REPORT}${newSupportTicketReportID}`)).resolves.toBeUndefined();
        await expect(getOnyxValue(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${newSupportTicketReportID}`)).resolves.toBeUndefined();
    });

    it('does not update Onyx when reopening a support ticket fails', async () => {
        // Given a resolved ticket and a failed reassignment request
        const resolvedSupportTicketReportID = 'resolvedSupportTicketReportID';
        const networkError = new Error('Network request failed');
        const onyxUpdateSpy = jest.spyOn(Onyx, 'update');
        mockMakeRequestWithSideEffects.mockRejectedValueOnce(networkError);

        // When the customer reopens the ticket
        await expect(openSupportTicket(resolvedSupportTicketReportID)).rejects.toBe(networkError);

        // Then no optimistic report exists to remove
        expect(onyxUpdateSpy).not.toHaveBeenCalled();
    });

    it('navigates to a newly reassigned support ticket', async () => {
        // Given a resolved support ticket and a server response for its reassignment
        const resolvedSupportTicketReportID = 'resolvedSupportTicketReportID';
        const serverCreatedReportID = 'serverCreatedSupportTicketReportID';
        mockMakeRequestWithSideEffects.mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS, reportID: serverCreatedReportID});
        mockGetReportRouteForCurrentContext.mockImplementation(({reportID}) => `r/${reportID}`);

        // When the customer reopens the ticket
        const request = openSupportTicket(resolvedSupportTicketReportID);

        // Then neither ticket is opened optimistically
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockMakeRequestWithSideEffects).toHaveBeenCalledWith(
            SIDE_EFFECT_REQUEST_COMMANDS.CREATE_SUPPORT_TICKET,
            expect.objectContaining({
                resolvedSupportTicketReportID,
            }),
            {},
        );
        expect(mockMakeRequestWithSideEffects.mock.calls.at(0)?.[1]).not.toHaveProperty('newSupportTicketReportID');
        expect(mockGenerateReportID).not.toHaveBeenCalled();

        await request;

        // And the App opens the report chosen by the server
        expect(mockGetReportRouteForCurrentContext).toHaveBeenCalledWith({reportID: serverCreatedReportID});
        expect(mockNavigate).toHaveBeenCalledWith(`r/${serverCreatedReportID}`);
    });

    it('navigates to the returned ticket when the server reopens it', async () => {
        // Given a resolved support ticket and a response that reopens it with the existing assignee
        const resolvedSupportTicketReportID = 'resolvedSupportTicketReportID';
        mockMakeRequestWithSideEffects.mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS, reportID: resolvedSupportTicketReportID});
        mockGetReportRouteForCurrentContext.mockImplementation(({reportID}) => `r/${reportID}`);

        // When the customer reopens the ticket
        await openSupportTicket(resolvedSupportTicketReportID);

        // Then the App navigates to the report returned by the server
        expect(mockGetReportRouteForCurrentContext).toHaveBeenCalledWith({reportID: resolvedSupportTicketReportID});
        expect(mockNavigate).toHaveBeenCalledWith(`r/${resolvedSupportTicketReportID}`);
    });

    it('recognizes the no-rep response', () => {
        // Given the exact error returned when the backend cannot assign a support rep
        const response = {jsonCode: CONST.JSON_CODE.EXP_ERROR, message: 'No support rep is available to take this ticket.'};

        // When the App inspects the response
        const isNoSupportRepAvailable = isNoSupportRepAvailableResponse(response);

        // Then it can show the Concierge fallback instead of leaving the pending ticket open
        expect(isNoSupportRepAvailable).toBe(true);
    });

    it.each<{jsonCode: number; message?: string}>([
        {jsonCode: CONST.JSON_CODE.EXP_ERROR, message: 'We could not create this support ticket.'},
        {jsonCode: CONST.JSON_CODE.BAD_REQUEST, message: 'No support rep is available to take this ticket.'},
        {jsonCode: CONST.JSON_CODE.EXP_ERROR, message: undefined},
    ])('does not mistake other failures for the no-rep response', (response) => {
        // Given a failed response that is not the no-rep response

        // When the App inspects the response
        const isNoSupportRepAvailable = isNoSupportRepAvailableResponse(response);

        // Then it does not show the Concierge fallback
        expect(isNoSupportRepAvailable).toBe(false);
    });
});
