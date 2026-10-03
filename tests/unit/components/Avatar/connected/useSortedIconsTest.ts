import {renderHook} from '@testing-library/react-native';

import useSortedIcons from '@components/Avatar/connected/useSortedIcons';

import CONST from '@src/CONST';
import type {PersonalDetailsList} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';

const ZOE_ACCOUNT_ID = 42;
const ADAM_ACCOUNT_ID = 7;
const POLICY_ID = 'policy123';

// Icons carry their own displayName, as the ones built by useAccountIcons do
const ZOE_ICON: Icon = {id: ZOE_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: 'https://example.com/zoe.png', name: 'zoe@example.com', displayName: 'Zoe'};
const ADAM_ICON: Icon = {id: ADAM_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: 'https://example.com/adam.png', name: 'adam@example.com', displayName: 'Adam'};
// A workspace icon has no displayName and no personal details, so its empty name sorts first
const WORKSPACE_ICON: Icon = {id: POLICY_ID, type: CONST.ICON_TYPE_WORKSPACE, source: 'https://example.com/workspace.png', name: 'Acme Workspace'};
// An account icon without a displayName is named through personal details
const UNNAMED_ZOE_ICON: Icon = {id: ZOE_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: 'https://example.com/zoe.png', name: ''};

const ICONS = [ZOE_ICON, ADAM_ICON, WORKSPACE_ICON];

let mockPersonalDetails: PersonalDetailsList = {};

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        localeCompare: (first: string, second: string) => first.localeCompare(second),
    })),
);

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: () => mockPersonalDetails,
}));

describe('useSortedIcons', () => {
    beforeEach(() => {
        mockPersonalDetails = {};
    });

    it('should keep the given order without a sort', () => {
        // Given icons in an arbitrary order and no sort
        // When the hook resolves the order
        const {result} = renderHook(() => useSortedIcons(ICONS, undefined));

        // Then the icons are returned untouched, so a caller can rely on its own order
        expect(result.current).toBe(ICONS);
    });

    it.each([
        ['by name', CONST.REPORT_ACTION_AVATARS.SORT_BY.NAME, [WORKSPACE_ICON, ADAM_ICON, ZOE_ICON]],
        ['by ID', CONST.REPORT_ACTION_AVATARS.SORT_BY.ID, [ADAM_ICON, ZOE_ICON, WORKSPACE_ICON]],
        ['reversed', CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE, [WORKSPACE_ICON, ADAM_ICON, ZOE_ICON]],
        ['by name and then reversed', [CONST.REPORT_ACTION_AVATARS.SORT_BY.NAME, CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE], [ZOE_ICON, ADAM_ICON, WORKSPACE_ICON]],
        ['by ID and then reversed', [CONST.REPORT_ACTION_AVATARS.SORT_BY.ID, CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE], [WORKSPACE_ICON, ZOE_ICON, ADAM_ICON]],
    ])('should order the icons %s', (_case, sort, expectedIcons) => {
        // Given icons in an arbitrary order and a sort
        // When the hook resolves the order
        const {result} = renderHook(() => useSortedIcons(ICONS, sort));

        // Then the icons come back in the requested order, and the given array is left as it was
        expect(result.current).toEqual(expectedIcons);
        expect(ICONS).toEqual([ZOE_ICON, ADAM_ICON, WORKSPACE_ICON]);
    });

    it('should name an icon without a displayName through personal details when sorting by name', () => {
        // Given an account icon that carries no displayName, whose personal details are loaded
        mockPersonalDetails = {[ZOE_ACCOUNT_ID]: {accountID: ZOE_ACCOUNT_ID, displayName: 'Zoe'}};

        // When the icons are sorted by name
        const {result} = renderHook(() => useSortedIcons([UNNAMED_ZOE_ICON, ADAM_ICON], CONST.REPORT_ACTION_AVATARS.SORT_BY.NAME));

        // Then the icon sorts by the personal-details name rather than its empty name
        expect(result.current).toEqual([ADAM_ICON, UNNAMED_ZOE_ICON]);
    });
});
