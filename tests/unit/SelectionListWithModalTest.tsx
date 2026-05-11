import {act, render} from '@testing-library/react-native';
import React from 'react';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem, SelectionListProps} from '@components/SelectionList/types';
import SelectionListWithModal from '@components/SelectionListWithModal';
import CONST from '@src/CONST';

// Captures the `data` prop that SelectionListWithModal hands down to the inner SelectionList,
// so the test can assert what FlashList would actually have seen on each render.
const capturedDataPropPerRender: ListItem[][] = [];

jest.mock('@components/SelectionList', () => {
    function MockSelectionList<TItem extends ListItem>({data}: SelectionListProps<TItem>) {
        capturedDataPropPerRender.push((data ?? []) as ListItem[]);
        return null;
    }
    return MockSelectionList;
});

jest.mock('@components/Modal', () => () => null);
jest.mock('@components/MenuItem', () => () => null);

jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual<typeof import('@react-navigation/native')>('@react-navigation/native');
    return {
        ...actual,
        useIsFocused: jest.fn(() => true),
    };
});

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        numberFormat: (n: number) => n.toString(),
    })),
);

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

jest.mock('@hooks/useMobileSelectionMode', () => jest.fn(() => false));

jest.mock('@hooks/useHandleSelectionMode', () => jest.fn());

jest.mock('@hooks/useResponsiveLayout', () =>
    jest.fn(() => ({
        isSmallScreenWidth: false,
        shouldUseNarrowLayout: false,
    })),
);

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({CheckSquare: null}),
}));

const makeItems = (prefix: string, count: number): ListItem[] =>
    Array.from({length: count}, (_, index) => ({
        keyForList: `${prefix}-${index}`,
        text: `${prefix} item ${index}`,
    }));

const lastCapturedData = (): ListItem[] => {
    const last = capturedDataPropPerRender.at(-1);
    if (!last) {
        throw new Error('Inner SelectionList was never rendered');
    }
    return last;
};

const FULL_LIST = makeItems('full', 100);
const FILTER_FO = makeItems('fo', 5);
const FILTER_BA = makeItems('ba', 3);

describe('SelectionListWithModal', () => {
    beforeEach(() => {
        capturedDataPropPerRender.length = 0;
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    // Regression test for the Categories "Cannot read properties of undefined (reading 'isSelected')" crash:
    // when the user clears the search and re-types a different query within SEARCH_OPTION_LIST_DEBOUNCE_TIME,
    // `debouncedData` still holds items from the previous query. The component must not hand those stale items
    // to the inner SelectionList (which would then hand them to FlashList and crash on a recycled cell).
    it('never hands the inner SelectionList items that are not in the current data prop', () => {
        const {rerender} = render(
            <OnyxListItemProvider>
                <SelectionListWithModal
                    data={FULL_LIST}
                    ListItem={SingleSelectListItem}
                    onSelectRow={() => {}}
                />
            </OnyxListItemProvider>,
        );

        // 1) Type "fo" - data shrinks to 5 items. Within the debounce window the heuristic keeps the larger
        //    (debounced) data on screen to avoid FlashList layout thrash. That's the original intent.
        act(() => {
            rerender(
                <OnyxListItemProvider>
                    <SelectionListWithModal
                        data={FILTER_FO}
                        ListItem={SingleSelectListItem}
                        onSelectRow={() => {}}
                    />
                </OnyxListItemProvider>,
            );
        });

        // 2) Let the 300ms debounce settle - debouncedData catches up to 5 items.
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME + 50);
        });

        // 3) User clears the search - data expands back to 100 items.
        act(() => {
            rerender(
                <OnyxListItemProvider>
                    <SelectionListWithModal
                        data={FULL_LIST}
                        ListItem={SingleSelectListItem}
                        onSelectRow={() => {}}
                    />
                </OnyxListItemProvider>,
            );
        });

        // 4) User types a different query "ba" BEFORE the debounce settles. data is now 3 items with totally
        //    different keys than the prior "fo" filter. The pre-fix code would set displayData = debouncedData
        //    (5 stale "fo" items) because it only compared lengths. We must instead fall back to filteredData.
        act(() => {
            rerender(
                <OnyxListItemProvider>
                    <SelectionListWithModal
                        data={FILTER_BA}
                        ListItem={SingleSelectListItem}
                        onSelectRow={() => {}}
                    />
                </OnyxListItemProvider>,
            );
        });

        const handedToInnerList = lastCapturedData();
        const currentInputKeys = new Set(FILTER_BA.map((item) => item.keyForList));

        // Every key handed downstream must be present in the latest input data - no stale items from "fo".
        for (const item of handedToInnerList) {
            expect(currentInputKeys.has(item.keyForList)).toBe(true);
        }
    });

    it('still keeps the larger debounced view when filteredData is a strict subset (anti-flicker path)', () => {
        // Mount with full list, then filter down to a strict subset - debouncedData is still the full list,
        // and because every key in filteredData is also in debouncedData, we keep showing the larger view.
        const subset = FULL_LIST.slice(0, 5);

        const {rerender} = render(
            <OnyxListItemProvider>
                <SelectionListWithModal
                    data={FULL_LIST}
                    ListItem={SingleSelectListItem}
                    onSelectRow={() => {}}
                />
            </OnyxListItemProvider>,
        );

        act(() => {
            rerender(
                <OnyxListItemProvider>
                    <SelectionListWithModal
                        data={subset}
                        ListItem={SingleSelectListItem}
                        onSelectRow={() => {}}
                    />
                </OnyxListItemProvider>,
            );
        });

        // No timer advance - debouncedData hasn't caught up yet, so we should still see the larger debounced view.
        expect(lastCapturedData()).toHaveLength(FULL_LIST.length);

        // Once the debounce settles, the inner list catches up to the smaller filteredData.
        act(() => {
            jest.advanceTimersByTime(CONST.TIMING.SEARCH_OPTION_LIST_DEBOUNCE_TIME + 50);
        });
        expect(lastCapturedData()).toHaveLength(subset.length);
    });
});
