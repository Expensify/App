import {fireEvent} from '@testing-library/react-native';
import type {RenderResult} from '@testing-library/react-native';
import React, {useCallback, useMemo, useState} from 'react';
import type {ComponentType} from 'react';
import {measureRenders} from 'reassure';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import type {KeyboardStateContextValue} from '@components/withKeyboardState';
import type {WithLocalizeProps} from '@components/withLocalize';
import variables from '@styles/variables';

type SelectionListWrapperProps = {
    /** Whether this is a multi-select list */
    canSelectMultiple?: boolean;
};

jest.mock('@components/Icon/Expensicons');

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn(),
    })),
);

jest.mock('@components/withLocalize', <TProps extends WithLocalizeProps>() => (Component: ComponentType<TProps>) => {
    function WrappedComponent(props: Omit<TProps, keyof WithLocalizeProps>) {
        return (
            <Component
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props as TProps)}
                translate={() => ''}
            />
        );
    }
    WrappedComponent.displayName = `WrappedComponent`;
    return WrappedComponent;
});

jest.mock('@hooks/useNetwork', () =>
    jest.fn(() => ({
        isOffline: false,
    })),
);

jest.mock('@components/withKeyboardState', () => <TProps extends KeyboardStateContextValue>(Component: ComponentType<TProps>) => {
    function WrappedComponent(props: Omit<TProps, keyof KeyboardStateContextValue>) {
        return (
            <Component
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...(props as TProps)}
                isKeyboardShown={false}
            />
        );
    }
    WrappedComponent.displayName = `WrappedComponent`;
    return WrappedComponent;
});

jest.mock('@react-navigation/stack', () => ({
    useCardAnimation: () => {},
}));

jest.mock('@react-navigation/native', () => ({
    useFocusEffect: () => {},
    useIsFocused: () => true,
    createNavigationContainerRef: jest.fn(),
}));

jest.mock('../../src/hooks/useKeyboardState', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(() => ({
        isKeyboardShown: false,
        keyboardHeight: 0,
    })),
}));

jest.mock('../../src/hooks/useScreenWrapperTransitionStatus', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(() => ({
        didScreenTransitionEnd: true,
    })),
}));

const LIST_ITEM_COUNT = 1000;
const LIST_ITEM_VIEWPORT_COUNT = 5; // the number of items visible in the viewport
const MOCKED_SCREEN_WIDTH = 300;
function SelectionListWrapper({canSelectMultiple}: SelectionListWrapperProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const sections = useMemo(
        () => [
            {
                data: Array.from({length: LIST_ITEM_COUNT}, (element, index) => ({
                    text: `Item ${index}`,
                    keyForList: `item-${index}`,
                    isSelected: selectedIds.includes(`item-${index}`),
                })),
                isDisabled: false,
            },
        ],
        [selectedIds],
    );

    const onSelectRow = useCallback(
        (item: ListItem) => {
            if (!item.keyForList) {
                return;
            }

            if (canSelectMultiple) {
                if (selectedIds.includes(item.keyForList)) {
                    setSelectedIds(selectedIds.filter((selectedId) => selectedId !== item.keyForList));
                } else {
                    setSelectedIds([...selectedIds, item.keyForList]);
                }
            } else {
                setSelectedIds([item.keyForList]);
            }
        },
        [canSelectMultiple, selectedIds],
    );

    return (
        <SelectionList
            textInputLabel="Perf test"
            sections={sections}
            onSelectRow={onSelectRow}
            initiallyFocusedOptionKey="item-0"
            ListItem={RadioListItem}
            canSelectMultiple={canSelectMultiple}
            getItemHeight={() => variables.optionRowWebItemHeight}
        />
    );
}

test('[SelectionList] should render 1 section and a thousand items', async () => {
    await measureRenders(<SelectionListWrapper />, {warmupRuns: 0, runs: 1});
});

test('[SelectionList] should press a list item', async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const scenario = async (screen: RenderResult) => {
        fireEvent.press(screen.getByText('Item 5'));
    };

    await measureRenders(<SelectionListWrapper />, {scenario});
});

test('[SelectionList] should render multiple selection and select 3 items', async () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const scenario = async (screen: RenderResult) => {
        fireEvent.press(screen.getByText('Item 1'));
        fireEvent.press(screen.getByText('Item 2'));
        fireEvent.press(screen.getByText('Item 3'));
    };

    await measureRenders(<SelectionListWrapper canSelectMultiple />, {scenario});
});

test('[SelectionList] should scroll and select a few items', async () => {
    const rowHeight = variables.optionRowWebItemHeight + variables.optionRowListItemPadding;
    const eventData = {
        nativeEvent: {
            contentOffset: {
                // Advance scroll by X items
                y: rowHeight * LIST_ITEM_VIEWPORT_COUNT,
            },
            contentSize: {
                // The total size of the list
                height: rowHeight * LIST_ITEM_COUNT,
                width: MOCKED_SCREEN_WIDTH,
            },
            layoutMeasurement: {
                // The size of the viewport
                height: rowHeight * LIST_ITEM_VIEWPORT_COUNT,
                width: MOCKED_SCREEN_WIDTH,
            },
        },
    };

    // eslint-disable-next-line @typescript-eslint/require-await
    const scenario = async (screen: RenderResult) => {
        // Set the content size of the list first, otherwise the list has contentSize: 0 during all events
        // see https://github.com/callstack/react-native-testing-library/issues/1540
        fireEvent(screen.getByTestId('selection-list'), 'onContentSizeChange', eventData.nativeEvent.contentSize.width, eventData.nativeEvent.contentSize.height);

        fireEvent.press(screen.getByText('Item 1'));
        fireEvent.scroll(screen.getByTestId('selection-list'), eventData);
        fireEvent.press(screen.getByText('Item 7'));
        fireEvent.press(screen.getByText('Item 10'));
    };

    await measureRenders(<SelectionListWrapper canSelectMultiple />, {scenario});
});
