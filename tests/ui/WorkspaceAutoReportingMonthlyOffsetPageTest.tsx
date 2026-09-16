import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';

import WorkspaceAutoReportingMonthlyOffsetPage from '@pages/workspace/workflows/WorkspaceAutoReportingMonthlyOffsetPage';

import type {Policy} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {
        ...actualNavigation,
        // No-op focus effect: useInitialSelection still freezes via its useState seed, which is what we assert on.
        useFocusEffect: jest.fn(),
    };
});

// withPolicy injects the policy from Onyx; the test injects it directly instead.
jest.mock('@pages/workspace/withPolicy', () => (component: unknown) => component);
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/BlockingViews/FullPageNotFoundView',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => jest.fn(() => null));
jest.mock('@hooks/useReviewWorkspaceSettingsTaskCompletion', () => jest.fn(() => () => undefined));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        toLocaleOrdinal: (day: number) => String(day),
    })),
);

type MockListItem = {value: string; keyForList: string; isSelected?: boolean; text?: string; isNumber?: boolean};

type MockSelectionListProps = {
    data: MockListItem[];
    initiallyFocusedItemKey?: string;
    shouldScrollToFocusedIndexOnMount?: boolean;
    shouldUpdateFocusedIndex?: boolean;
    disableMaintainingScrollPosition?: boolean;
    onSelectRow: (item: MockListItem) => void;
};

type PageProps = {policy: Policy; route: {params: {policyID: string}}};

// The identity-mocked withPolicy renders the inner component, so re-type the export to the props it actually accepts.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- re-typing the identity-mocked HOC export to its inner component props
const Page = WorkspaceAutoReportingMonthlyOffsetPage as unknown as React.ComponentType<PageProps>;

function pageElement(offset: number) {
    return (
        <Page
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only the offset field is read in this page
            policy={{id: 'policy1', autoReportingOffset: offset} as Policy}
            route={{params: {policyID: 'policy1'}}}
        />
    );
}

describe('WorkspaceAutoReportingMonthlyOffsetPage', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrows the props captured from the mocked SelectionList in this test
    const getSelectionListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('pins the initially selected day to the top on open', () => {
        // The 15th sorts to the middle, so seeing it first proves pinning (not the natural day order) put it there.
        render(pageElement(15));

        const props = getSelectionListProps();
        expect(props?.data.at(0)?.value).toBe('15');
        expect(props?.data.at(0)?.isSelected).toBe(true);
        // The 1st would be first if nothing were pinned.
        expect(props?.data.at(0)?.value).not.toBe('1');
        expect(props?.initiallyFocusedItemKey).toBe('15');
        expect(props?.shouldScrollToFocusedIndexOnMount).toBe(false);
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
        expect(props?.disableMaintainingScrollPosition).toBe(true);
    });

    it('keeps the originally pinned day at the top while the live selection changes', () => {
        render(pageElement(15));

        // Simulate the user picking a different day; the frozen pin must not jump to it.
        act(() => {
            getSelectionListProps()?.onSelectRow({value: '3', keyForList: '3', isNumber: true});
        });

        const props = getSelectionListProps();
        const order = props?.data.map((item) => item.value) ?? [];
        expect(order.at(0)).toBe('15');
        expect(order.indexOf('15')).toBeLessThan(order.indexOf('3'));
        // The checkmark still follows the live value.
        expect(props?.data.find((item) => item.value === '3')?.isSelected).toBe(true);
        expect(props?.data.find((item) => item.value === '15')?.isSelected).toBe(false);
    });
});
