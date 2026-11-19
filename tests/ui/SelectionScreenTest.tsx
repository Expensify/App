import {render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';
import SelectionScreen from '@components/SelectionScreen';
import type {SelectorType} from '@components/SelectionScreen';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
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
jest.mock(
    '@components/OfflineWithFeedback',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/ErrorMessageRow', () => jest.fn(() => null));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined]));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

type MockSelectorItem = {value: string; keyForList: string; isSelected?: boolean; text?: string};

type MockSelectionListProps = {
    data: MockSelectorItem[];
    initiallyFocusedItemKey?: string;
    shouldScrollToFocusedIndexOnMount?: boolean;
    shouldUpdateFocusedIndex?: boolean;
    disableMaintainingScrollPosition?: boolean;
};

/** Build `count` options; the option at `selectedIndex` is the pre-selected one. */
function buildData(count: number, selectedIndex: number): Array<SelectorType<string>> {
    return Array.from({length: count}, (_, index) => {
        const suffix = String(index + 1).padStart(2, '0');
        return {value: `v${suffix}`, keyForList: `k${suffix}`, text: `Option ${suffix}`, isSelected: index === selectedIndex};
    });
}

function screenElement(data: Array<SelectorType<string>>, {withSearch}: {withSearch: boolean}) {
    const selectedKey = data.find((item) => item.isSelected)?.keyForList;
    return (
        <SelectionScreen
            displayName="TestSelectionScreen"
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            data={data}
            onSelectRow={jest.fn()}
            initiallyFocusedOptionKey={selectedKey}
            textInputOptions={withSearch ? {label: 'Search', value: '', onChangeText: jest.fn()} : undefined}
            shouldShowTextInput={withSearch}
        />
    );
}

describe('SelectionScreen searchable list props', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrows the props captured from the mocked SelectionList in this test
    const getListProps = () => mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('enables the anti-jump list props for a searchable list without reordering the data', () => {
        // Given a searchable list (pinning happens upstream, before filtering)
        render(screenElement(buildData(13, 6), {withSearch: true}));

        // Then SelectionScreen passes the data through unchanged...
        const props = getListProps();
        expect(props?.data.at(0)?.keyForList).toBe('k01');
        // ...and enables the props that keep the pinned row visible on mount, on select, and after clearing search.
        expect(props?.shouldScrollToFocusedIndexOnMount).toBe(false);
        expect(props?.disableMaintainingScrollPosition).toBe(true);
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
    });

    it('leaves the scroll props at their defaults for a non-searchable list', () => {
        // Given a list with no search input
        render(screenElement(buildData(13, 6), {withSearch: false}));

        // Then the data is untouched and scroll behavior is left at its defaults
        const props = getListProps();
        expect(props?.data.at(0)?.keyForList).toBe('k01');
        expect(props?.shouldScrollToFocusedIndexOnMount).toBe(true);
        expect(props?.disableMaintainingScrollPosition).toBe(false);
    });
});
