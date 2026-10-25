import {act, renderHook} from '@testing-library/react-native';

import useOpenSupportTicket from '@hooks/useOpenSupportTicket';

import {isNoSupportRepAvailableResponse, openSupportTicket} from '@libs/actions/Report';
import Growl from '@libs/Growl';
import Navigation from '@libs/Navigation/Navigation';

const mockOpenConciergeAnywhere = jest.fn();

jest.mock('@libs/actions/Report', () => ({
    openSupportTicket: jest.fn(),
    isNoSupportRepAvailableResponse: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn(), getActiveRoute: jest.fn(() => '/r/1')}));
jest.mock('@libs/Growl', () => ({error: jest.fn()}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useOpenConciergeAnywhere', () => () => ({openConciergeAnywhere: mockOpenConciergeAnywhere}));

const mockOpenSupportTicket = jest.mocked(openSupportTicket);
const mockIsNoSupportRepAvailableResponse = jest.mocked(isNoSupportRepAvailableResponse);

describe('useOpenSupportTicket', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns nothing from the callback so a menu row does not wait on the ticket request', () => {
        // Given a ticket request that has not finished
        mockOpenSupportTicket.mockReturnValue(new Promise(() => {}));
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
        jest.mocked(Navigation.getActiveRoute).mockReturnValue('/r/1');
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
        jest.mocked(Navigation.getActiveRoute).mockReturnValueOnce('/r/1').mockReturnValue('/r/2?isPendingCreation=true');
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

    it('ignores a failed ticket request', async () => {
        // Given a ticket request that fails
        mockOpenSupportTicket.mockRejectedValue(new Error('network'));
        const {result} = renderHook(() => useOpenSupportTicket());

        // When the callback runs and the request settles
        await act(async () => {
            result.current.openSupportTicketOrConcierge();
            await Promise.resolve();
        });

        // Then nothing else happens
        expect(Growl.error).not.toHaveBeenCalled();
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });
});
