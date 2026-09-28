import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import ChangeReceiptBillingAccountPage from '@pages/workspace/receiptPartners/ChangeReceiptBillingAccountPage';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';
import type {PropsWithChildren} from 'react';

import React from 'react';

const mockUseState = React.useState;

const POLICY_ID = 'policy1';
const INTEGRATION = 'uber';

let mockPolicy: Policy | undefined;
let mockPersonalDetails: Record<string, {displayName: string; accountID: number; login: string; avatar: string}>;

function buildPersonalDetails(count: number) {
    const details: Record<string, {displayName: string; accountID: number; login: string; avatar: string}> = {};
    for (let index = 0; index < count; index++) {
        const email = `user${String(index).padStart(2, '0')}@example.com`;
        details[email] = {displayName: `User ${String(index).padStart(2, '0')}`, accountID: index, login: email, avatar: ''};
    }
    return details;
}

/** Build a policy with `count` members and a central billing account set to `centralEmail`. */
function buildPolicy(count: number, centralEmail: string): Policy {
    const employeeList: Record<string, {email: string; role: string}> = {};
    for (let index = 0; index < count; index++) {
        const email = `user${String(index).padStart(2, '0')}@example.com`;
        employeeList[email] = {email, role: CONST.POLICY.ROLE.USER};
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only minimal Policy stub
    return {
        id: POLICY_ID,
        employeeList,
        receiptPartners: {[INTEGRATION]: {centralBillingAccountEmail: centralEmail}},
    } as unknown as Policy;
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
jest.mock('@components/SelectionList/ListItem/InviteMemberListItem', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
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
jest.mock('@hooks/useOnyx', () => jest.fn(() => ['US']));
jest.mock('@hooks/usePolicy', () => jest.fn(() => mockPolicy));
jest.mock('@hooks/usePersonalDetailByLogin', () => ({
    usePersonalDetailsByLogins: jest.fn(() => mockPersonalDetails),
}));
jest.mock('@hooks/useDebouncedState', () =>
    jest.fn((initialValue: string) => {
        const [value, setValue] = mockUseState(initialValue);
        return [value, value, setValue];
    }),
);

jest.mock('@libs/OptionsListUtils', () => ({
    formatMemberForList: (member: Record<string, unknown>) => ({...member}),
    sortAlphabetically: (items: Array<Record<string, string>>, key: string, cmp: (a: string, b: string) => number) => [...items].sort((a, b) => cmp(a[key] ?? '', b[key] ?? '')),
    getSearchValueForPhoneOrEmail: (value: string) => value,
    getHeaderMessage: () => '',
}));
jest.mock('@libs/PolicyUtils', () => ({
    isDeletedPolicyEmployee: jest.fn(() => false),
}));
jest.mock('@libs/actions/Policy/Policy', () => ({changePolicyUberBillingAccount: jest.fn()}));
jest.mock('@libs/DeviceCapabilities', () => ({canUseTouchScreen: jest.fn(() => false)}));
jest.mock('@libs/Navigation/Navigation', () => ({goBack: jest.fn()}));

type MockSelectionListProps = {
    data: Array<{value?: string; keyForList?: string; isSelected?: boolean; text?: string}>;
    initiallyFocusedItemKey?: string;
    shouldUpdateFocusedIndex?: boolean;
    textInputOptions?: {onChangeText?: (value: string) => void};
};

function renderPage() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only route stub. The page only reads route.params
    const props = {route: {params: {policyID: POLICY_ID, integration: INTEGRATION}}} as unknown as React.ComponentProps<typeof ChangeReceiptBillingAccountPage>;
    return render(<ChangeReceiptBillingAccountPage {...props} />);
}

describe('ChangeReceiptBillingAccountPage', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

    beforeEach(() => {
        mockedSelectionList.mockClear();
        mockPersonalDetails = buildPersonalDetails(CONST.STANDARD_LIST_ITEM_LIMIT + 2);
        // "user07" sorts to the middle, so seeing it first proves pinning (not the sort) put it there.
        mockPolicy = buildPolicy(CONST.STANDARD_LIST_ITEM_LIMIT + 2, 'user07@example.com');
    });

    it('pins the central billing account to the top on open', () => {
        renderPage();

        const props = getSelectionListProps();
        expect(props?.data.at(0)?.value).toBe('user07@example.com');
        expect(props?.data.at(0)?.isSelected).toBe(true);
        // Alphabetically "user00" would be first if nothing were pinned.
        expect(props?.data.at(0)?.value).not.toBe('user00@example.com');
        expect(props?.initiallyFocusedItemKey).toBe('user07@example.com');
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
    });

    it('keeps the pinned billing account at the top while searching', () => {
        renderPage();

        act(() => {
            getSelectionListProps()?.textInputOptions?.onChangeText?.('User 07');
        });

        expect(getSelectionListProps()?.data.at(0)?.value).toBe('user07@example.com');
    });

    it('does not reorder when the member list is under the item-limit threshold', () => {
        mockPersonalDetails = buildPersonalDetails(CONST.STANDARD_LIST_ITEM_LIMIT - 2);
        mockPolicy = buildPolicy(CONST.STANDARD_LIST_ITEM_LIMIT - 2, 'user05@example.com');

        renderPage();

        const props = getSelectionListProps();
        // Below the threshold moveInitialSelectionToTop is a no-op, so the natural alphabetical order is preserved.
        expect(props?.data.at(0)?.value).toBe('user00@example.com');
    });
});
