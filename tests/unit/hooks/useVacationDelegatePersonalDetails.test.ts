/**
 * These tests verify that the hook only asks the server for the vacation delegate's personal details when
 * they are missing locally, which is what brings the delegate's name and avatar back after a cache clear.
 */
import {renderHook} from '@testing-library/react-native';

import usePersonalDetailByLogin from '@hooks/usePersonalDetailByLogin';
import useVacationDelegatePersonalDetails from '@hooks/useVacationDelegatePersonalDetails';

import {searchUserInServer} from '@libs/actions/Report';

import type {PersonalDetails} from '@src/types/onyx';

jest.mock('@hooks/usePersonalDetailByLogin', () => jest.fn(() => undefined));

jest.mock('@libs/actions/Report', () => ({
    searchUserInServer: jest.fn(),
}));

const mockUsePersonalDetailByLogin = jest.mocked(usePersonalDetailByLogin);
const mockSearchUserInServer = jest.mocked(searchUserInServer);

const EMAIL_DELEGATE = 'jane@example.com';
const PHONE_DELEGATE_WITH_SMS_DOMAIN = '+919789942470@expensify.sms';
const PHONE_DELEGATE_RAW = '+919789942470';

describe('useVacationDelegatePersonalDetails', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePersonalDetailByLogin.mockReturnValue(undefined);
    });

    it('returns the personal details of the delegate without hitting the server when they are already known', () => {
        const personalDetails: PersonalDetails = {
            accountID: 42,
            login: EMAIL_DELEGATE,
            displayName: 'Jane Doe',
            avatar: 'jane-avatar',
        };
        mockUsePersonalDetailByLogin.mockReturnValue(personalDetails);

        const {result} = renderHook(() => useVacationDelegatePersonalDetails(EMAIL_DELEGATE));

        expect(result.current).toBe(personalDetails);
        expect(mockSearchUserInServer).not.toHaveBeenCalled();
    });

    it('looks the delegate up by its lower-cased login', () => {
        renderHook(() => useVacationDelegatePersonalDetails('Jane@Example.com'));

        expect(mockUsePersonalDetailByLogin).toHaveBeenCalledWith(EMAIL_DELEGATE);
    });

    // Bug #89578 — after a cache clear only the login survives, so the details have to be fetched again.
    it('fetches the details once when they are missing', () => {
        const {rerender} = renderHook(() => useVacationDelegatePersonalDetails(EMAIL_DELEGATE));

        expect(mockSearchUserInServer).toHaveBeenCalledTimes(1);
        expect(mockSearchUserInServer).toHaveBeenCalledWith(EMAIL_DELEGATE);

        rerender({});

        expect(mockSearchUserInServer).toHaveBeenCalledTimes(1);
    });

    it('strips the SMS domain from a phone delegate before fetching', () => {
        renderHook(() => useVacationDelegatePersonalDetails(PHONE_DELEGATE_WITH_SMS_DOMAIN));

        expect(mockSearchUserInServer).toHaveBeenCalledWith(PHONE_DELEGATE_RAW);
    });

    it('does not fetch anything when there is no delegate', () => {
        const {result} = renderHook(() => useVacationDelegatePersonalDetails(undefined));

        expect(result.current).toBeUndefined();
        expect(mockSearchUserInServer).not.toHaveBeenCalled();
    });
});
