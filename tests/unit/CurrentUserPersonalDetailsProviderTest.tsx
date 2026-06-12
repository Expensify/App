import {renderHook} from '@testing-library/react-native';
import React, {useContext} from 'react';
import {CurrentUserPersonalDetailsContext, CurrentUserPersonalDetailsProvider} from '@components/CurrentUserPersonalDetailsProvider';
import {useSession} from '@components/OnyxListItemProvider';
import useOnyx from '@hooks/useOnyx';
import type {PersonalDetailsList} from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@components/OnyxListItemProvider', () => ({
    useSession: jest.fn(),
}));

const mockUseOnyx = useOnyx as jest.MockedFunction<typeof useOnyx>;
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

type PersonalDetailsSelector = (allPersonalDetails: PersonalDetailsList | undefined) => CurrentUserPersonalDetails;

/**
 * Render the provider and return the `selector` it passes to `useOnyx`.
 * The fix made this selector pure, so we exercise it directly here.
 */
function getSelector(): PersonalDetailsSelector {
    renderHook(() => useContext(CurrentUserPersonalDetailsContext), {
        wrapper: ({children}) => <CurrentUserPersonalDetailsProvider>{children}</CurrentUserPersonalDetailsProvider>,
    });

    const lastCall = mockUseOnyx.mock.calls.at(-1);
    const options = lastCall?.at(1) as {selector: PersonalDetailsSelector} | undefined;
    return options?.selector as PersonalDetailsSelector;
}

describe('CurrentUserPersonalDetailsProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseOnyx.mockReturnValue([undefined, {status: 'loaded'}] as ReturnType<typeof useOnyx>);
    });

    it('returns the current account details from the selector', () => {
        mockUseSession.mockReturnValue({accountID: 1, email: 'owner@example.com'});

        const selector = getSelector();
        const result = selector({1: {accountID: 1, login: 'owner@example.com', displayName: 'Owner'}});

        expect(result.accountID).toBe(1);
        expect(result.email).toBe('owner@example.com');
        expect(result.displayName).toBe('Owner');
    });

    it('does not mutate the cached personal details list', () => {
        mockUseSession.mockReturnValue({accountID: 2, email: 'agent@example.com'});

        const selector = getSelector();
        const cached = {accountID: 2, login: 'agent@example.com', displayName: 'Agent'} as const;
        const allPersonalDetails = {2: {...cached}};

        selector(allPersonalDetails);

        // The selector must not write accountID/email/other fields onto the shared Onyx cache entry.
        expect(allPersonalDetails[2]).toEqual(cached);
    });

    it('returns a fresh object on each run so identity changes are detected', () => {
        mockUseSession.mockReturnValue({accountID: 3, email: 'user@example.com'});

        const selector = getSelector();
        const allPersonalDetails = {3: {accountID: 3, login: 'user@example.com', displayName: 'User'}};

        const first = selector(allPersonalDetails);
        const second = selector(allPersonalDetails);

        // A new reference each run is what lets useOnyx detect the change after an account switch
        // (the previous impure selector returned the same mutated reference and suppressed updates).
        expect(first).not.toBe(second);
        expect(first).toEqual(second);
    });
});
