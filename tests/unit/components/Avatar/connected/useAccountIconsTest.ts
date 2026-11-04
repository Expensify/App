import {renderHook} from '@testing-library/react-native';

import useAccountIcons, {useSeededAccountIcons} from '@components/Avatar/connected/useAccountIcons';

import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import type {PersonalDetailsList} from '@src/types/onyx';

const ACCOUNT_ID = 42;
const OTHER_ACCOUNT_ID = 7;
const AVATAR_URL = 'https://example.com/uploaded-avatar.png';
const LOGIN = 'john@example.com';
const INVITED_EMAIL = 'invited@example.com';

// Stands in for the bundled fallback SVG so the resolved icon can be asserted by identity.
function MockFallbackAvatar() {
    return null;
}

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({
        ConciergeAvatar: MockFallbackAvatar,
        NotificationsAvatar: MockFallbackAvatar,
        FallbackAvatar: MockFallbackAvatar,
    }),
}));

let mockPersonalDetails: PersonalDetailsList = {};

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: () => mockPersonalDetails,
}));

describe('useAccountIcons', () => {
    beforeEach(() => {
        mockPersonalDetails = {
            [ACCOUNT_ID]: {
                accountID: ACCOUNT_ID,
                login: LOGIN,
                avatar: AVATAR_URL,
            },
        };
    });

    it('should resolve an account from the personal-details context', () => {
        const {result} = renderHook(() => useAccountIcons([ACCOUNT_ID]));

        expect(result.current).toEqual([
            {
                id: ACCOUNT_ID,
                type: CONST.ICON_TYPE_AVATAR,
                source: AVATAR_URL,
                name: LOGIN,
                displayName: LOGIN,
                fallbackIcon: undefined,
            },
        ]);
    });

    it('should fall back to the default fallback avatar for an account with no personal details', () => {
        const {result} = renderHook(() => useAccountIcons([OTHER_ACCOUNT_ID]));

        expect(result.current).toEqual([
            {
                id: OTHER_ACCOUNT_ID,
                type: CONST.ICON_TYPE_AVATAR,
                source: MockFallbackAvatar,
                name: '',
                fallbackIcon: undefined,
            },
        ]);
    });

    it('should preserve the order the account IDs were passed in', () => {
        const {result} = renderHook(() => useAccountIcons([OTHER_ACCOUNT_ID, ACCOUNT_ID]));

        expect(result.current.map((icon) => icon.id)).toEqual([OTHER_ACCOUNT_ID, ACCOUNT_ID]);
    });

    it('should seed a deterministic fallback avatar for an invited account, and only for that account', () => {
        const {result} = renderHook(() => useAccountIcons([OTHER_ACCOUNT_ID, ACCOUNT_ID], {[INVITED_EMAIL]: OTHER_ACCOUNT_ID}));

        const [invitedIcon, registeredIcon] = result.current;
        expect(invitedIcon.name).toBe(INVITED_EMAIL);
        expect(invitedIcon.fallbackIcon).toBeDefined();
        expect(registeredIcon.name).toBe(LOGIN);
        expect(registeredIcon.fallbackIcon).toBeUndefined();
    });

    it('should return an empty list for no account IDs', () => {
        const {result} = renderHook(() => useAccountIcons([]));

        expect(result.current).toEqual([]);
    });
});

describe('useSeededAccountIcons', () => {
    beforeEach(() => {
        mockPersonalDetails = {
            [ACCOUNT_ID]: {accountID: ACCOUNT_ID, login: LOGIN, avatar: AVATAR_URL},
        };
    });

    it.each([
        ['keep the uploaded avatar for an account with personal details', ACCOUNT_ID, AVATAR_URL],
        ['seed the default avatar from the account ID for an account with no personal details', OTHER_ACCOUNT_ID, getDefaultAvatarURL({accountID: OTHER_ACCOUNT_ID})],
        ['keep the generic fallback for the unknown account', CONST.DEFAULT_NUMBER_ID, MockFallbackAvatar],
    ])('should %s', (_case, accountID, expectedSource) => {
        const {result} = renderHook(() => useSeededAccountIcons([accountID]));

        expect(result.current).toEqual([expect.objectContaining({id: accountID, source: expectedSource})]);
    });
});
