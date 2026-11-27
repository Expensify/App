import {act, renderHook} from '@testing-library/react-native';

import {useAskConciergeActions} from '@hooks/useIsInAskConcierge';
import useOpenSupportTicket from '@hooks/useOpenSupportTicket';

import {isNoSupportRepAvailableResponse, openSupportTicket} from '@libs/actions/Report';
import Growl from '@libs/Growl';
import Navigation from '@libs/Navigation/Navigation';

const mockOpenConciergeAnywhere = jest.fn();
const CONCIERGE_REPORT_ID = '9';

jest.mock('@libs/actions/Report', () => ({
    openSupportTicket: jest.fn(),
    isNoSupportRepAvailableResponse: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn(), getActiveRoute: jest.fn(), getFocusedReportId: jest.fn()}));
jest.mock('@libs/Growl', () => ({error: jest.fn()}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useOnyx', () => () => [CONCIERGE_REPORT_ID]);
jest.mock('@hooks/useOpenConciergeAnywhere', () => () => ({openConciergeAnywhere: mockOpenConciergeAnywhere}));
jest.mock('@hooks/useIsInAskConcierge', () => ({useAskConciergeActions: jest.fn(() => ({}))}));

const mockOpenSupportTicket = jest.mocked(openSupportTicket);
const mockGetActiveRoute = jest.mocked(Navigation.getActiveRoute);
const mockGetFocusedReportId = jest.mocked(Navigation.getFocusedReportId);

const CHAT_ROUTE = '/r/1';
const PENDING_TICKET_ROUTE = '/r/2/?isPendingCreation=true';
const mockIsNoSupportRepAvailableResponse = jest.mocked(isNoSupportRepAvailableResponse);

describe('useOpenSupportTicket', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useAskConciergeActions).mockReturnValue({});
    });

    it('returns nothing from the callback so a menu row does not wait on the ticket request', () => {
        // Given a ticket request that has not finished
        mockOpenSupportTicket.mockReturnValue(new Promise(() => {}));
        mockGetActiveRoute.mockReturnValue(PENDING_TICKET_ROUTE);
        const {result} = renderHook(() => useOpenSupportTicket());

        // When the callback runs
        const returnValue: unknown = result.current.openSupportTicketOrConcierge();

        // Then it returns nothing, so single execution on native clears as soon as the transition ends
        expect(returnValue).toBeUndefined();
        expect(mockOpenSupportTicket).toHaveBeenCalledTimes(1);
    });

    it('does not show an error or open Concierge when a support rep takes the ticket', async () => {
        // Given a ticket request that a rep picks up
        mockOpenSupportTicket.mockResolvedValue(undefined);
        mockIsNoSupportRepAvailableResponse.mockReturnValue(false);
        mockGetActiveRoute.mockReturnValue(PENDING_TICKET_ROUTE);
        const {result} = renderHook(() => useOpenSupportTicket());

        // When the callback runs and the request finishes
        await act(async () => {
            result.current.openSupportTicketOrConcierge();
            await Promise.resolve();
        });

        // Then there is no error toast and no fallback navigation
        expect(Growl.error).not.toHaveBeenCalled();
        expect(Navigation.goBack).not.toHaveBeenCalled();
        expect(mockOpenConciergeAnywhere).not.toHaveBeenCalled();
    });

    it('shows an error and opens Concierge without navigating when the failed ticket screen is already gone', async () => {
        // Given a ticket request that finds no rep, after its screen has taken itself down
        mockOpenSupportTicket.mockResolvedValue(undefined);
        mockIsNoSupportRepAvailableResponse.mockReturnValue(true);
        // The ticket screen is open when the request starts, and gone by the time it resolves
        mockGetActiveRoute.mockReturnValueOnce(PENDING_TICKET_ROUTE).mockReturnValue(CHAT_ROUTE);
        const {result} = renderHook(() => useOpenSupportTicket());

        // When the callback runs and the request finishes
        await act(async () => {
            result.current.openSupportTicketOrConcierge();
            await Promise.resolve();
        });

        // Then the customer sees the error and stays put, because going back would pop the page behind the ticket
        expect(Growl.error).toHaveBeenCalledWith({bodyText: 'supportTicket.noSupportRepAvailable'});
        expect(Navigation.goBack).not.toHaveBeenCalled();
        expect(mockOpenConciergeAnywhere).toHaveBeenCalledWith({forceConcierge: true});
    });

    it('leaves the failed ticket screen when it is still open, then opens Concierge', async () => {
        // Given a ticket request that finds no rep while its screen is still open
        mockOpenSupportTicket.mockResolvedValue(undefined);
        mockIsNoSupportRepAvailableResponse.mockReturnValue(true);
        mockGetActiveRoute.mockReturnValue(PENDING_TICKET_ROUTE);
        const {result} = renderHook(() => useOpenSupportTicket());

        // When the callback runs and the request finishes
        await act(async () => {
            result.current.openSupportTicketOrConcierge();
            await Promise.resolve();
        });

        // Then the ticket screen is left behind
        expect(Growl.error).toHaveBeenCalledWith({bodyText: 'supportTicket.noSupportRepAvailable'});
        expect(Navigation.goBack).toHaveBeenCalledTimes(1);

        // And Concierge opens once that transition has finished
        const goBackOptions = jest.mocked(Navigation.goBack).mock.calls.at(0)?.at(1);
        if (typeof goBackOptions !== 'object') {
            throw new Error('goBack should receive options with an afterTransition callback');
        }
        expect(goBackOptions.afterTransition).toEqual(expect.any(Function));
        goBackOptions.afterTransition?.();
        expect(mockOpenConciergeAnywhere).toHaveBeenCalledWith({forceConcierge: true});
    });

    it('does not open Concierge again when the customer is already in the Concierge chat', async () => {
        // Given a ticket request that finds no rep while the customer is in the Concierge chat
        mockOpenSupportTicket.mockResolvedValue(undefined);
        mockIsNoSupportRepAvailableResponse.mockReturnValue(true);
        mockGetActiveRoute.mockReturnValue(PENDING_TICKET_ROUTE);
        mockGetFocusedReportId.mockReturnValueOnce(CONCIERGE_REPORT_ID);
        const {result} = renderHook(() => useOpenSupportTicket());

        // When the callback runs, the request finishes and the ticket screen is left
        await act(async () => {
            result.current.openSupportTicketOrConcierge();
            await Promise.resolve();
        });
        const goBackOptions = jest.mocked(Navigation.goBack).mock.calls.at(0)?.at(1);
        if (typeof goBackOptions !== 'object') {
            throw new Error('goBack should receive options with an afterTransition callback');
        }
        goBackOptions.afterTransition?.();

        // Then the error is shown and Concierge is not opened a second time
        expect(Growl.error).toHaveBeenCalledWith({bodyText: 'supportTicket.noSupportRepAvailable'});
        expect(mockOpenConciergeAnywhere).not.toHaveBeenCalled();
    });

    it('leaves the pending ticket screen when the request fails', async () => {
        // Given a ticket request that fails while its screen is still open
        mockOpenSupportTicket.mockRejectedValue(new Error('network'));
        mockGetActiveRoute.mockReturnValue(PENDING_TICKET_ROUTE);
        const {result} = renderHook(() => useOpenSupportTicket());

        // When the callback runs and the request settles
        await act(async () => {
            result.current.openSupportTicketOrConcierge();
            await Promise.resolve();
        });

        // Then the ticket screen is left without an error toast or Concierge
        expect(Navigation.goBack).toHaveBeenCalledTimes(1);
        expect(Growl.error).not.toHaveBeenCalled();
        expect(mockOpenConciergeAnywhere).not.toHaveBeenCalled();
    });

    it('leaves the pending ticket screen when the server returns another error', async () => {
        // Given a ticket request answered with an error that is not the no-rep response
        mockOpenSupportTicket.mockResolvedValue({jsonCode: 666, message: 'Something else'});
        mockIsNoSupportRepAvailableResponse.mockReturnValue(false);
        mockGetActiveRoute.mockReturnValue(PENDING_TICKET_ROUTE);
        const {result} = renderHook(() => useOpenSupportTicket());

        // When the callback runs and the request finishes
        await act(async () => {
            result.current.openSupportTicketOrConcierge();
            await Promise.resolve();
        });

        // Then the ticket screen is left and Concierge is not opened
        expect(Navigation.goBack).toHaveBeenCalledTimes(1);
        expect(mockOpenConciergeAnywhere).not.toHaveBeenCalled();
    });

    it('does not navigate when the request fails after the ticket screen is already gone', async () => {
        // Given a ticket request that fails after the customer has left the ticket screen
        mockOpenSupportTicket.mockRejectedValue(new Error('network'));
        mockGetActiveRoute.mockReturnValueOnce(PENDING_TICKET_ROUTE).mockReturnValue(CHAT_ROUTE);
        const {result} = renderHook(() => useOpenSupportTicket());

        // When the callback runs and the request settles
        await act(async () => {
            result.current.openSupportTicketOrConcierge();
            await Promise.resolve();
        });

        // Then nothing is popped from the page they are on
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('uses the Concierge thread opener when the ticket is requested inside Concierge', async () => {
        // Given a conversation embedded in the Concierge screen
        const openConciergeThread = jest.fn();
        jest.mocked(useAskConciergeActions).mockReturnValue({openConciergeThread});
        mockOpenSupportTicket.mockResolvedValue({jsonCode: 200});
        mockIsNoSupportRepAvailableResponse.mockReturnValue(false);
        const {result} = renderHook(() => useOpenSupportTicket());

        // When the customer asks to talk to a human
        await act(async () => {
            result.current.openSupportTicketOrConcierge();
        });

        // Then ticket creation uses the embedded opener rather than leaving for Inbox
        expect(mockOpenSupportTicket).toHaveBeenCalledWith(undefined, openConciergeThread);
        expect(Navigation.goBack).not.toHaveBeenCalled();
        expect(mockOpenConciergeAnywhere).not.toHaveBeenCalled();
    });

    it('ignores repeated presses while creation is pending and allows retrying after failure', async () => {
        // Given an embedded conversation with a pending ticket request
        jest.mocked(useAskConciergeActions).mockReturnValue({openConciergeThread: jest.fn()});
        let rejectRequest: ((error: Error) => void) | undefined;
        mockOpenSupportTicket.mockReturnValueOnce(
            new Promise((_resolve, reject) => {
                rejectRequest = reject;
            }),
        );
        const {result} = renderHook(() => useOpenSupportTicket());

        // When the customer presses twice before creation completes
        result.current.openSupportTicketOrConcierge();
        result.current.openSupportTicketOrConcierge();

        // Then only one ticket is requested, and a failed request can be retried
        expect(mockOpenSupportTicket).toHaveBeenCalledTimes(1);
        await act(async () => {
            rejectRequest?.(new Error('network'));
        });
        mockOpenSupportTicket.mockResolvedValueOnce(undefined);
        await act(async () => {
            result.current.openSupportTicketOrConcierge();
        });
        expect(mockOpenSupportTicket).toHaveBeenCalledTimes(2);
    });

    it.each(['no-rep', 'server', 'network'])('keeps the original Concierge conversation open after a %s failure', async (failure) => {
        // Given a failed ticket request inside Concierge, which never opened a pending ticket route
        jest.mocked(useAskConciergeActions).mockReturnValue({openConciergeThread: jest.fn()});
        mockGetActiveRoute.mockReturnValue(CHAT_ROUTE);
        mockIsNoSupportRepAvailableResponse.mockReturnValue(failure === 'no-rep');
        if (failure === 'network') {
            mockOpenSupportTicket.mockRejectedValue(new Error('network'));
        } else {
            mockOpenSupportTicket.mockResolvedValue({jsonCode: 666});
        }
        const {result} = renderHook(() => useOpenSupportTicket());

        // When creation fails while the original conversation is still visible
        await act(async () => {
            result.current.openSupportTicketOrConcierge();
        });

        // Then no page is popped and no duplicate Concierge panel is opened
        expect(Navigation.goBack).not.toHaveBeenCalled();
        expect(mockOpenConciergeAnywhere).not.toHaveBeenCalled();
        if (failure === 'no-rep') {
            expect(Growl.error).toHaveBeenCalledWith({bodyText: 'supportTicket.noSupportRepAvailable'});
        } else {
            expect(Growl.error).not.toHaveBeenCalled();
        }
    });
});
