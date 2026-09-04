import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import AssigneeStep from '@pages/workspace/expensifyCard/issueNew/AssigneeStep';

import CONST from '@src/CONST';
import type * as OnyxKeysModule from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {IssueNewCardData} from '@src/types/onyx/Card';

import type * as ReactNavigation from '@react-navigation/native';
import type {PropsWithChildren} from 'react';

import React from 'react';

const mockUseState = React.useState;

const POLICY_ID = 'policy1';

let mockIssueNewCard: {data?: Partial<IssueNewCardData>; isEditing?: boolean} | undefined;
let mockPolicy: Policy | undefined;
let mockPersonalDetails: Record<string, {displayName: string; accountID: number; avatar: string}>;

function buildPersonalDetails(count: number) {
    const details: Record<string, {displayName: string; accountID: number; avatar: string}> = {};
    for (let index = 0; index < count; index++) {
        const email = `user${String(index).padStart(2, '0')}@example.com`;
        details[email] = {displayName: `User ${String(index).padStart(2, '0')}`, accountID: index, avatar: ''};
    }
    return details;
}

/** Build a policy whose employeeList has `count` members. */
function buildPolicy(count: number): Policy {
    const employeeList: Record<string, {email: string; role: string}> = {};
    for (let index = 0; index < count; index++) {
        const email = `user${String(index).padStart(2, '0')}@example.com`;
        employeeList[email] = {email, role: CONST.POLICY.ROLE.USER};
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only minimal Policy stub
    return {id: POLICY_ID, employeeList} as unknown as Policy;
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
jest.mock('@components/Text', () => jest.fn(() => null));
jest.mock('@components/InteractiveStepWrapper', () => jest.fn(({children}: PropsWithChildren) => children));

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
jest.mock('@hooks/useDefaultFundID', () => jest.fn(() => undefined));
jest.mock('@hooks/useCurrencyForExpensifyCard', () => jest.fn(() => 'USD'));
jest.mock('@hooks/useOnyx', () => {
    const onyxKeys = jest.requireActual<typeof OnyxKeysModule>('@src/ONYXKEYS').default;
    return jest.fn((key: string) => {
        if (typeof key === 'string' && key.startsWith(onyxKeys.COLLECTION.RAM_ONLY_ISSUE_NEW_EXPENSIFY_CARD)) {
            return [mockIssueNewCard];
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
            availableOptions: {selectedOptions: [], recentOptions: [], personalDetails: [], userToInvite: undefined},
            areOptionsInitialized: true,
        };
    }),
);

jest.mock('@libs/PolicyUtils', () => ({
    canMemberWrite: jest.fn(() => true),
    filterGuideAndAccountManager: (list: unknown) => list,
    getGuideAndAccountManagerInfo: jest.fn(() => ({assignedGuideEmail: undefined, accountManagerLogin: undefined, exclusions: {}})),
    getIneligibleInvitees: jest.fn(() => []),
    isDeletedPolicyEmployee: jest.fn(() => false),
}));
jest.mock('@libs/OptionsListUtils', () => ({
    getSearchValueForPhoneOrEmail: (value: string) => value,
    sortAlphabetically: (items: Array<Record<string, string>>, key: string, cmp: (a: string, b: string) => number) => {
        items.sort((a, b) => cmp(a[key] ?? '', b[key] ?? ''));
        return items;
    },
}));
jest.mock('@libs/PersonalDetailOptionsListUtils', () => ({getHeaderMessage: () => ''}));
jest.mock('@libs/PersonalDetailsUtils', () => ({
    getPersonalDetailByEmail: (email: string) => mockPersonalDetails[email],
    getUserNameByEmail: () => '',
}));
jest.mock('@libs/actions/Report', () => ({searchUserInServer: jest.fn()}));
jest.mock('@navigation/Navigation', () => ({goBack: jest.fn(), navigate: jest.fn()}));
jest.mock('@userActions/Card', () => ({
    clearIssueNewCardFlow: jest.fn(),
    getCardDefaultName: jest.fn(() => ''),
    setDraftInviteAccountID: jest.fn(),
    setIssueNewCardStepAndData: jest.fn(),
}));

type MockSelectionListProps = {
    data: Array<{value?: string; keyForList?: string; isSelected?: boolean; text?: string}>;
    initiallyFocusedItemKey?: string;
    shouldUpdateFocusedIndex?: boolean;
    textInputOptions?: {onChangeText?: (value: string) => void};
};

function renderStep() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only route stub. The step only reads route.params.policyID
    const props = {
        policy: mockPolicy,
        stepNames: ['Assignee'],
        startStepIndex: 0,
        route: {params: {policyID: POLICY_ID}},
    } as unknown as React.ComponentProps<typeof AssigneeStep>;
    return render(<AssigneeStep {...props} />);
}

describe('IssueNewCard AssigneeStep', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

    beforeEach(() => {
        mockedSelectionList.mockClear();
        mockPersonalDetails = buildPersonalDetails(CONST.STANDARD_LIST_ITEM_LIMIT + 2);
        mockPolicy = buildPolicy(CONST.STANDARD_LIST_ITEM_LIMIT + 2);
        // "user07" sorts to the middle, so seeing it first proves pinning (not the sort) put it there.
        mockIssueNewCard = {data: {assigneeEmail: 'user07@example.com'}, isEditing: false};
    });

    it('pins the initially selected assignee to the top on open', () => {
        renderStep();

        const props = getSelectionListProps();
        expect(props?.data.at(0)?.value).toBe('user07@example.com');
        expect(props?.data.at(0)?.isSelected).toBe(true);
        // Alphabetically "user00" would be first if nothing were pinned.
        expect(props?.data.at(0)?.value).not.toBe('user00@example.com');
        expect(props?.initiallyFocusedItemKey).toBe('user07@example.com');
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
    });

    it('keeps the pinned assignee at the top while searching', () => {
        renderStep();

        act(() => {
            getSelectionListProps()?.textInputOptions?.onChangeText?.('User 07');
        });

        expect(getSelectionListProps()?.data.at(0)?.value).toBe('user07@example.com');
    });

    it('does not reorder when the member list is under the item-limit threshold', () => {
        mockPersonalDetails = buildPersonalDetails(CONST.STANDARD_LIST_ITEM_LIMIT - 2);
        mockPolicy = buildPolicy(CONST.STANDARD_LIST_ITEM_LIMIT - 2);
        mockIssueNewCard = {data: {assigneeEmail: 'user05@example.com'}, isEditing: false};

        renderStep();

        const props = getSelectionListProps();
        // Below the threshold moveInitialSelectionToTop is a no-op, so the natural alphabetical order is preserved.
        expect(props?.data.at(0)?.value).toBe('user00@example.com');
    });
});
