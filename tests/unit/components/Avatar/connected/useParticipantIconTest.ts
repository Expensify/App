import {renderHook} from '@testing-library/react-native';

import useParticipantIcon from '@components/Avatar/connected/useParticipantIcon';

import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

const ACCOUNT_ID = 42;
const LOGIN = 'john@example.com';
const DISPLAY_NAME = 'John Doe';
const AVATAR_URL = 'https://example.com/uploaded-avatar.png';
const SNAPSHOT_DISPLAY_NAME = 'Johnny Snapshot';
const SNAPSHOT_AVATAR_URL = 'https://example.com/snapshot-avatar.png';
const HIDDEN_NAME_KEY = 'common.hidden';

// Stands in for the bundled fallback SVG so the resolved icon can be asserted by identity.
function MockFallbackAvatar() {
    return null;
}

// Serves the Search snapshot of personal details from the map, so a test only declares whether it exists.
let mockOnyxData: Record<string, unknown> = {};

jest.mock('@hooks/useOnyx', () => (key: string, options?: {selector?: (value: unknown) => unknown}) => {
    const value = mockOnyxData[key];
    return [options?.selector ? options.selector(value) : value, {status: 'loaded'}];
});

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({
        ConciergeAvatar: MockFallbackAvatar,
        NotificationsAvatar: MockFallbackAvatar,
        FallbackAvatar: MockFallbackAvatar,
    }),
}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        formatPhoneNumber: (phoneNumber: string) => phoneNumber,
        translate: (key: string) => key,
    })),
);

let mockPersonalDetails: PersonalDetailsList = {};

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: () => mockPersonalDetails,
}));

describe('useParticipantIcon', () => {
    beforeEach(() => {
        mockOnyxData = {};
        mockPersonalDetails = {};
    });

    it.each([
        [
            'picture and name an account by its personal details',
            ACCOUNT_ID,
            {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, login: LOGIN, displayName: DISPLAY_NAME, avatar: AVATAR_URL}},
            undefined,
            {id: ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: AVATAR_URL, name: DISPLAY_NAME, fallbackIcon: undefined},
        ],
        [
            'name an account by its login without a display name',
            ACCOUNT_ID,
            {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, login: LOGIN, avatar: AVATAR_URL}},
            undefined,
            {id: ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: AVATAR_URL, name: LOGIN, fallbackIcon: undefined},
        ],
        [
            'seed a default avatar and name the account "Hidden" without personal details',
            ACCOUNT_ID,
            {},
            undefined,
            {id: ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: getDefaultAvatarURL({accountID: ACCOUNT_ID}), name: HIDDEN_NAME_KEY, fallbackIcon: undefined},
        ],
        [
            'prefer the Search snapshot over the live personal details',
            ACCOUNT_ID,
            {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, login: LOGIN, displayName: DISPLAY_NAME, avatar: AVATAR_URL}},
            {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, login: LOGIN, displayName: SNAPSHOT_DISPLAY_NAME, avatar: SNAPSHOT_AVATAR_URL}},
            {id: ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: SNAPSHOT_AVATAR_URL, name: SNAPSHOT_DISPLAY_NAME, fallbackIcon: undefined},
        ],
        ['resolve no account to the unknown account', undefined, {}, undefined, {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: MockFallbackAvatar, name: ''}],
        [
            'resolve the unknown account ID to the unknown account',
            CONST.DEFAULT_NUMBER_ID,
            {},
            undefined,
            {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: MockFallbackAvatar, name: ''},
        ],
    ])('should %s', (_case, accountID, livePersonalDetails, snapshotPersonalDetails, expectedIcon) => {
        // Given the live personal details and, on a Search surface, the snapshot ones
        mockPersonalDetails = livePersonalDetails;
        mockOnyxData[ONYXKEYS.PERSONAL_DETAILS_LIST] = snapshotPersonalDetails;

        // When the participant is resolved into an icon
        const {result} = renderHook(() => useParticipantIcon(accountID));

        // Then it matches the icon the legacy component builds for a report participant
        expect(result.current).toEqual(expectedIcon);
    });
});
