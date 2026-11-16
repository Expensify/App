import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import type {shouldHideExpensifyTeamCardholder} from '@libs/PolicyUtils/expensifyTeam';

import AssigneeStep from '@pages/workspace/expensifyCard/issueNew/AssigneeStep';

import CONST from '@src/CONST';
import type * as OnyxKeysModule from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {IssueNewCardData} from '@src/types/onyx/Card';

import type * as ReactNavigation from '@react-navigation/native';
import type {PropsWithChildren} from 'react';

import React from 'react';

type ExpensifyTeamUtils = {shouldHideExpensifyTeamCardholder: typeof shouldHideExpensifyTeamCardholder};

const mockUseState = React.useState;

const POLICY_ID = 'policy1';
const EXPENSIFY_TEAM_MEMBER = 'guide@team.expensify.com';

let mockIssueNewCard: {data?: Partial<IssueNewCardData>; isEditing?: boolean} | undefined;
let mockPolicy: Policy | undefined;
let mockPersonalDetails: Record<string, {displayName: string; accountID: number; avatar: string}>;
let mockAvailableOptions: {selectedOptions: unknown[]; recentOptions: unknown[]; personalDetails: unknown[]; userToInvite: unknown} = {
    selectedOptions: [],
    recentOptions: [],
    personalDetails: [],
    userToInvite: undefined,
};

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
    return {id: POLICY_ID, owner: 'owner@example.com', employeeList} as unknown as Policy;
}

/** Add an Expensify-team member (a guide) to the policy's employeeList. */
function withExpensifyTeamMember(policy: Policy): Policy {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only minimal Policy stub
    return {...policy, employeeList: {...policy.employeeList, [EXPENSIFY_TEAM_MEMBER]: {email: EXPENSIFY_TEAM_MEMBER, role: CONST.POLICY.ROLE.USER}}} as unknown as Policy;
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
        if (key === onyxKeys.SESSION) {
            return [{email: 'current@example.com'}];
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
            availableOptions: mockAvailableOptions,
            areOptionsInitialized: true,
        };
    }),
);

jest.mock('@libs/PolicyUtils', () => ({
    canMemberWrite: jest.fn(() => true),
    canRoleCreateExpenses: jest.fn((role?: string) => role !== 'approveOnly'),
    filterGuideAndAccountManager: (list: unknown) => list,
    getGuideAndAccountManagerInfo: jest.fn(() => ({assignedGuideEmail: undefined, accountManagerLogin: undefined, exclusions: {}})),
    getIneligibleInvitees: jest.fn(() => []),
    isDeletedPolicyEmployee: jest.fn(() => false),
    shouldHideExpensifyTeamCardholder: jest.requireActual<ExpensifyTeamUtils>('@libs/PolicyUtils/expensifyTeam').shouldHideExpensifyTeamCardholder,
}));
jest.mock('@libs/OptionsListUtils', () => ({
    getSearchValueForPhoneOrEmail: (value: string) => value,
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
    data: Array<{value?: string; login?: string | null; keyForList?: string; isSelected?: boolean; text?: string}>;
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
        mockAvailableOptions = {selectedOptions: [], recentOptions: [], personalDetails: [], userToInvite: undefined};
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

    it('hides Expensify team members, matching the Workspace Members page', () => {
        mockPolicy = withExpensifyTeamMember(buildPolicy(CONST.STANDARD_LIST_ITEM_LIMIT + 2));

        renderStep();

        expect(getSelectionListProps()?.data.some((item) => item.value === EXPENSIFY_TEAM_MEMBER)).toBe(false);
    });

    it('still shows the already-assigned Expensify team member so editing an assignment does not blank out', () => {
        mockPolicy = withExpensifyTeamMember(buildPolicy(CONST.STANDARD_LIST_ITEM_LIMIT + 2));
        mockIssueNewCard = {data: {assigneeEmail: EXPENSIFY_TEAM_MEMBER}, isEditing: true};

        renderStep();

        expect(getSelectionListProps()?.data.some((item) => item.value === EXPENSIFY_TEAM_MEMBER)).toBe(true);
    });

    it('shows Expensify team members when the policy is owned by Expensify', () => {
        const policy = withExpensifyTeamMember(buildPolicy(CONST.STANDARD_LIST_ITEM_LIMIT + 2));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only minimal Policy stub
        mockPolicy = {...policy, owner: 'owner@expensify.com'} as unknown as Policy;

        renderStep();

        expect(getSelectionListProps()?.data.some((item) => item.value === EXPENSIFY_TEAM_MEMBER)).toBe(true);
    });

    it('hides Expensify team accounts that come back from search results', () => {
        // Given an admin who can invite members, so search also offers non-members, and search results that include
        // Expensify team accounts alongside an ordinary user
        mockAvailableOptions = {
            selectedOptions: [],
            recentOptions: [{login: 'support@expensify.com', keyForList: 'support@expensify.com'}],
            personalDetails: [
                {login: EXPENSIFY_TEAM_MEMBER, keyForList: EXPENSIFY_TEAM_MEMBER},
                {login: 'outside@example.com', keyForList: 'outside@example.com'},
            ],
            userToInvite: {login: 'new@team.expensify.com', keyForList: 'new@team.expensify.com'},
        };
        renderStep();

        // When the admin searches
        act(() => {
            getSelectionListProps()?.textInputOptions?.onChangeText?.('e');
        });

        // Then only the ordinary user is offered, because the member-list filter would be pointless if search could
        // bring the same Expensify team accounts back
        const logins = getSelectionListProps()?.data.map((item) => item.login);
        expect(logins).toContain('outside@example.com');
        expect(logins).not.toContain(EXPENSIFY_TEAM_MEMBER);
        expect(logins).not.toContain('support@expensify.com');
        expect(logins).not.toContain('new@team.expensify.com');
    });
});
