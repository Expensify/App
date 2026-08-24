import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import AssigneeStep from '@pages/workspace/companyCards/assignCard/AssigneeStep';

import CONST from '@src/CONST';
import type * as OnyxKeysModule from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';
import type {PropsWithChildren} from 'react';

import React from 'react';

const mockUseState = React.useState;

const POLICY_ID = 'policy1';
const FEED = 'feed1';
const CARD_ID = 'card1';
// "user09" sorts to the middle by display name, so seeing it first proves pinning (not the sort) put it there.
const INITIAL_ASSIGNEE = 'user09@example.com';

// The current assignee comes from Onyx; a mutable holder lets each test set it (and clear it) before render.
let mockAssigneeEmail: string | undefined;
let mockPolicy: Policy | undefined;

/** Build a policy whose employeeList has `count` members keyed user00..user{count-1} (zero-padded so the display-name sort is stable). */
function buildPolicy(count: number): Policy {
    const employeeList: Record<string, {email: string; role: string}> = {};
    for (let index = 0; index < count; index++) {
        const email = `user${String(index).padStart(2, '0')}@example.com`;
        employeeList[email] = {email, role: CONST.POLICY.ROLE.USER};
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only minimal Policy stub
    return {id: POLICY_ID, owner: 'owner@example.com', employeeList} as unknown as Policy;
}

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {
        ...actualNavigation,
        // No-op focus effect: useInitialSelection still freezes via its useState seed, which is what we assert on.
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/UserListItem', () => jest.fn(() => null));
jest.mock('@components/InteractiveStepWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/Text', () => jest.fn(() => null));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => jest.fn(({children}: PropsWithChildren) => children));

jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({FallbackAvatar: 'fallback-avatar'})),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        localeCompare: (a: string, b: string) => a.localeCompare(b),
        formatPhoneNumber: (value: string) => value,
    })),
);
jest.mock('@hooks/usePolicy', () => jest.fn(() => mockPolicy));
jest.mock('@hooks/useOnyx', () => {
    const OnyxKeys = jest.requireActual<typeof OnyxKeysModule>('@src/ONYXKEYS').default;
    return jest.fn((key: string) => {
        if (key === OnyxKeys.ASSIGN_CARD) {
            return [{cardToAssign: {email: mockAssigneeEmail}}];
        }
        if (key === OnyxKeys.SESSION) {
            return [{email: 'current@example.com'}];
        }
        if (key === OnyxKeys.COUNTRY_CODE) {
            return ['US'];
        }
        return [undefined];
    });
});
jest.mock('@hooks/usePersonalDetailSearchSelector', () =>
    jest.fn(() => {
        const [searchTerm, setSearchTerm] = mockUseState('');
        return {
            searchTerm,
            setSearchTerm,
            debouncedSearchTerm: searchTerm,
            availableOptions: {selectedOptions: [], recentOptions: [], personalDetails: [], userToInvite: null},
            areOptionsInitialized: true,
        };
    }),
);

jest.mock('@libs/PersonalDetailsUtils', () => ({
    getPersonalDetailByEmail: jest.fn((email: string) => {
        const index = Number(email.replace('user', '').replace('@example.com', ''));
        return {displayName: `User ${email.replace('user', '').replace('@example.com', '')}`, accountID: index, login: email, avatar: ''};
    }),
}));
jest.mock('@libs/PolicyUtils', () => ({
    canMemberWrite: jest.fn(() => false),
    filterGuideAndAccountManager: jest.fn((items: unknown[]) => items),
    getGuideAndAccountManagerInfo: jest.fn(() => ({assignedGuideEmail: undefined, accountManagerLogin: undefined, exclusions: {}})),
    getIneligibleInvitees: jest.fn(() => []),
    isDeletedPolicyEmployee: jest.fn(() => false),
}));
jest.mock('@libs/OptionsListUtils', () => ({
    sortAlphabetically: (items: Array<Record<string, string>>, key: string, cmp: (a: string, b: string) => number) => [...items].sort((a, b) => cmp(a[key] ?? '', b[key] ?? '')),
    getSearchValueForPhoneOrEmail: (value: string) => value,
}));
jest.mock('@libs/PersonalDetailOptionsListUtils', () => ({
    getHeaderMessage: jest.fn(() => ''),
}));
jest.mock('@navigation/Navigation', () => ({navigate: jest.fn(), goBack: jest.fn()}));
jest.mock('@libs/actions/Report', () => ({searchUserInServer: jest.fn()}));
jest.mock('@libs/actions/Card', () => ({setDraftInviteAccountID: jest.fn()}));
jest.mock('@userActions/CompanyCards', () => ({setAssignCardStepAndData: jest.fn()}));
jest.mock('@libs/CardUtils', () => ({
    getCardAssignmentDateOption: jest.fn(),
    getCardAssignmentStartDate: jest.fn(),
    getDefaultCardName: jest.fn(() => ''),
}));

type MockSelectionListProps = {
    data: Array<{value?: string; keyForList?: string; isSelected?: boolean; text?: string}>;
    initiallyFocusedItemKey?: string;
    shouldScrollToFocusedIndexOnMount?: boolean;
    shouldUpdateFocusedIndex?: boolean;
    textInputOptions?: {onChangeText?: (value: string) => void};
};

function renderStep() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only route stub; the page only reads route.params
    const props = {route: {params: {policyID: POLICY_ID, feed: FEED, cardID: CARD_ID}}} as unknown as React.ComponentProps<typeof AssigneeStep>;
    return render(<AssigneeStep {...props} />);
}

describe('AssignCard AssigneeStep', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

    beforeEach(() => {
        mockedSelectionList.mockClear();
        mockPolicy = buildPolicy(CONST.STANDARD_LIST_ITEM_LIMIT + 2);
        mockAssigneeEmail = INITIAL_ASSIGNEE;
    });

    it('pins the current assignee to the top and disables mount-time focused scroll', () => {
        renderStep();

        const props = getSelectionListProps();

        expect(props?.data.at(0)?.value).toBe(INITIAL_ASSIGNEE);
        expect(props?.data.at(0)?.isSelected).toBe(true);
        // Alphabetically "user00" would be first if nothing were pinned.
        expect(props?.data.at(0)?.value).not.toBe('user00@example.com');
        expect(props?.initiallyFocusedItemKey).toBe(INITIAL_ASSIGNEE);
        // Not scrolling to the focused item on mount keeps the pinned assignee visible at the top when returning via back.
        expect(props?.shouldScrollToFocusedIndexOnMount).toBe(false);
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
    });

    it('does not reorder when the member list is under the item-limit threshold', () => {
        mockPolicy = buildPolicy(CONST.STANDARD_LIST_ITEM_LIMIT - 2);
        mockAssigneeEmail = 'user05@example.com';

        renderStep();

        const props = getSelectionListProps();

        // Below the threshold moveInitialSelectionToTop is a no-op, so the natural alphabetical order is preserved.
        expect(props?.data.at(0)?.value).toBe('user00@example.com');
    });

    it('keeps the pinned assignee at the top while searching', () => {
        renderStep();

        act(() => {
            getSelectionListProps()?.textInputOptions?.onChangeText?.('User 09');
        });

        const props = getSelectionListProps();
        expect(props?.data.at(0)?.value).toBe(INITIAL_ASSIGNEE);
    });
});
