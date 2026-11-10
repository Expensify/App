import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import BaseDomainGroupPreferredWorkspacePage from '@pages/domain/Groups/BaseDomainGroupPreferredWorkspacePage';

import CONST from '@src/CONST';

import type * as ReactNavigation from '@react-navigation/native';
import type {PropsWithChildren} from 'react';

import React from 'react';

const mockUseState = React.useState;

let mockPolicies: Record<string, {id: string; name: string; created: string}>;

/** Build a POLICY collection with `count` admin workspaces (created dates ascend, so P01 sorts first). */
function buildPolicies(count: number) {
    const policies: Record<string, {id: string; name: string; created: string}> = {};
    for (let index = 1; index <= count; index++) {
        const num = String(index).padStart(2, '0');
        policies[`policy_P${num}`] = {id: `P${num}`, name: `Workspace ${num}`, created: `2020-01-${num}`};
    }
    return policies;
}

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/UserListItem', () => jest.fn(() => null));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/Text', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/CollapsibleHeaderOnKeyboard', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@pages/domain/DomainNotFoundPageWrapper', () => jest.fn(({children}: PropsWithChildren) => children));

jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@hooks/useIsInLandscapeMode', () => jest.fn(() => false));
jest.mock('@hooks/useKeyboardState', () => jest.fn(() => ({isKeyboardActive: false})));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        localeCompare: (a: string, b: string) => a.localeCompare(b),
    })),
);
jest.mock('@hooks/useOnyx', () => jest.fn(() => [mockPolicies]));
jest.mock('@hooks/useSearchResults', () =>
    jest.fn((data: Array<{value?: string}>) => {
        const [input, setInput] = mockUseState('');
        const filtered = input ? data.filter((item) => item.value?.includes(input)) : data;
        return [input, setInput, filtered];
    }),
);
jest.mock('@selectors/Policy', () => ({createAdminPoliciesSelector: () => (policies: unknown) => policies}));

type MockSelectionListProps = {
    data: Array<{value?: string; keyForList?: string; isSelected?: boolean}>;
    initiallyFocusedItemKey?: string;
    shouldScrollToFocusedIndexOnMount?: boolean;
    shouldUpdateFocusedIndex?: boolean;
    textInputOptions?: {onChangeText?: (value: string) => void};
};

function renderPage(selectedPolicyID: string) {
    return render(
        <BaseDomainGroupPreferredWorkspacePage
            domainAccountID={1}
            selectedPolicyID={selectedPolicyID}
            onSelectWorkspace={jest.fn()}
            shouldConfirmSelection
            onBackButtonPress={jest.fn()}
            testID="DomainGroupPreferredWorkspacePage"
        />,
    );
}

describe('BaseDomainGroupPreferredWorkspacePage', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

    beforeEach(() => {
        mockedSelectionList.mockClear();
        mockPolicies = buildPolicies(CONST.STANDARD_LIST_ITEM_LIMIT + 2);
    });

    it('pins the selected workspace to the top on open', () => {
        // P07 was created in the middle, so seeing it first proves pinning (not the created-date sort) put it there.
        renderPage('P07');

        const props = getSelectionListProps();
        expect(props?.data.at(0)?.value).toBe('P07');
        expect(props?.data.at(0)?.isSelected).toBe(true);
        // P01 is the oldest → natural first row.
        expect(props?.data.at(0)?.value).not.toBe('P01');
        expect(props?.initiallyFocusedItemKey).toBe('P07');
        expect(props?.shouldScrollToFocusedIndexOnMount).toBe(false);
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
    });

    it('keeps the selected workspace pinned at the top of the search results', () => {
        renderPage('P12');

        // "1" matches P01/P10-P14; P01 sorts first, so P12 leading proves the pin held.
        act(() => {
            getSelectionListProps()?.textInputOptions?.onChangeText?.('1');
        });

        expect(getSelectionListProps()?.data.at(0)?.value).toBe('P12');
    });

    it('does not reorder when the workspace list is under the item-limit threshold', () => {
        mockPolicies = buildPolicies(CONST.STANDARD_LIST_ITEM_LIMIT - 2);

        renderPage('P05');

        const props = getSelectionListProps();
        // Below the threshold moveInitialSelectionToTop is a no-op, so the created-date order is preserved.
        expect(props?.data.at(0)?.value).toBe('P01');
    });
});
