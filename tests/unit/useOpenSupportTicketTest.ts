import {renderHook} from '@testing-library/react-native';

import useOpenSupportTicket from '@hooks/useOpenSupportTicket';

import {openSupportTicket} from '@userActions/Report';

jest.mock('@userActions/Report', () => ({
    openSupportTicket: jest.fn(),
    isNoSupportRepAvailableResponse: jest.fn(() => false),
}));
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));
jest.mock('@libs/Growl', () => ({error: jest.fn()}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useOpenConciergeAnywhere', () => () => ({openConciergeAnywhere: jest.fn()}));

const mockOpenSupportTicket = jest.mocked(openSupportTicket);

describe('useOpenSupportTicket', () => {
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
});
