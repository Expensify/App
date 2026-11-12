import type {RenderResult} from '@testing-library/react-native';
import {fireEvent} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import variables from '@styles/variables';

import type * as NativeNavigation from '@react-navigation/native';

import {measureFirstChildLayout, measureItemLayout, measureParentSize} from '@shopify/flash-list/dist/recyclerview/utils/measureLayout';
import React, {useState} from 'react';
import {measureRenders} from 'reassure';

type SelectionListWrapperProps = {
    /** Whether this is a multi-select list */
    canSelectMultiple?: boolean;
};

const ITEM_COUNT = 1000;
const LIST_WIDTH = 100;
const VIEWPORT_HEIGHT = variables.optionRowHeight * 5;

// Jest has no layout engine, so FlashList reads row and viewport sizes from the measureLayout mock in
// jest/setupAfterEnv.ts. Size them from variables here so the scroll event below matches what FlashList renders.
beforeEach(() => {
    jest.mocked(measureParentSize).mockImplementation(() => ({x: 0, y: 0, width: LIST_WIDTH, height: VIEWPORT_HEIGHT}));
    jest.mocked(measureFirstChildLayout).mockImplementation(() => ({x: 0, y: 0, width: LIST_WIDTH, height: VIEWPORT_HEIGHT}));
    jest.mocked(measureItemLayout).mockImplementation(() => ({x: 0, y: 0, width: LIST_WIDTH, height: variables.optionRowHeight}));
});

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn(),
        numberFormat: jest.fn(),
    })),
);

jest.mock('@hooks/useNetwork', () =>
    jest.fn(() => ({
        isOffline: false,
    })),
);

jest.mock('@react-navigation/stack', () => ({
    useCardAnimation: () => {},
}));

jest.mock('@react-navigation/native', () => {
    // Spread the actual module so context objects like NavigationContainerRefContext and NavigationContext
    // remain defined. useResponsiveLayout (native) reads them via useContext, which crashes if they are undefined.
    const actualNav = jest.requireActual<typeof NativeNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: () => {},
        useIsFocused: () => true,
        createNavigationContainerRef: jest.fn(),
    };
});

jest.mock('../../src/hooks/useKeyboardState', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        isKeyboardShown: false,
        keyboardHeight: 0,
    })),
}));

jest.mock('../../src/hooks/useScreenWrapperTransitionStatus', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        didScreenTransitionEnd: true,
    })),
}));

jest.mock('@src/components/ConfirmedRoute.tsx');

function SelectionListWrapper({canSelectMultiple}: SelectionListWrapperProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const data = Array.from({length: ITEM_COUNT}, (element, index) => ({
        text: `Item ${index}`,
        keyForList: `item-${index}`,
        isSelected: selectedIds.includes(`item-${index}`),
    }));

    const onSelectRow = (item: ListItem) => {
        if (!item.keyForList) {
            return;
        }

        if (canSelectMultiple) {
            if (selectedIds.includes(item.keyForList)) {
                setSelectedIds(selectedIds.filter((selectedId) => selectedId === item.keyForList));
            } else {
                setSelectedIds([...selectedIds, item.keyForList]);
            }
        } else {
            setSelectedIds([item.keyForList]);
        }
    };

    return (
        <SelectionList
            textInputOptions={{label: 'Perf test'}}
            data={data}
            onSelectRow={onSelectRow}
            initiallyFocusedItemKey="item-0"
            ListItem={canSelectMultiple ? MultiSelectListItem : SingleSelectListItem}
            canSelectMultiple={canSelectMultiple}
        />
    );
}

test('[SelectionList] should render 1 section and a thousand items', async () => {
    await measureRenders(<SelectionListWrapper />);
});

test('[SelectionList] should press a list item', async () => {
    const scenario = async (screen: RenderResult) => {
        fireEvent.press(screen.getByText('Item 5'));
    };

    await measureRenders(<SelectionListWrapper />, {scenario});
});

test('[SelectionList] should render multiple selection and select 3 items', async () => {
    const scenario = async (screen: RenderResult) => {
        fireEvent.press(screen.getByText('Item 1'));
        fireEvent.press(screen.getByText('Item 2'));
        fireEvent.press(screen.getByText('Item 3'));
    };

    await measureRenders(<SelectionListWrapper canSelectMultiple />, {scenario});
});

test('[SelectionList] should scroll and select a few items', async () => {
    // Scrolls 8 rows down, so the rendered window covers both Item 7 and Item 15.
    const eventData = {
        nativeEvent: {
            contentOffset: {
                y: variables.optionRowHeight * 8,
            },
            contentSize: {
                // Dimensions of the scrollable content
                height: variables.optionRowHeight * ITEM_COUNT,
                width: LIST_WIDTH,
            },
            layoutMeasurement: {
                // Dimensions of the device
                height: VIEWPORT_HEIGHT,
                width: LIST_WIDTH,
            },
        },
    };

    const scenario = async (screen: RenderResult) => {
        fireEvent.press(screen.getByText('Item 1'));
        // see https://github.com/callstack/react-native-testing-library/issues/1540
        fireEvent(screen.getByTestId('selection-list'), 'onContentSizeChange', eventData.nativeEvent.contentSize.width, eventData.nativeEvent.contentSize.height);
        fireEvent.scroll(screen.getByTestId('selection-list'), eventData);
        fireEvent.press(screen.getByText('Item 7'));
        fireEvent.press(screen.getByText('Item 15'));
    };

    await measureRenders(<SelectionListWrapper canSelectMultiple />, {scenario});
});
