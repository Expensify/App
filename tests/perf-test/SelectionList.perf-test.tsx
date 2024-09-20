import {fireEvent} from '@testing-library/react-native';
import type {RenderResult} from '@testing-library/react-native';
import React, {useState} from 'react';
import type {ComponentType} from 'react';
import {measurePerformance} from 'reassure';
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
    __esModule: true, // Required in order to ensures ES6 module compatibility
    default: jest.fn(() => ({
        didScreenTransitionEnd: true,
    })),
}));

function SelectionListWrapper({canSelectMultiple}: SelectionListWrapperProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const sections = [
        {
            data: Array.from({length: 1000}, (element, index) => ({
                text: `Item ${index}`,
                keyForList: `item-${index}`,
                isSelected: selectedIds.includes(`item-${index}`),
            })),
            isDisabled: false,
        },
    ];

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
            textInputLabel="Perf test"
            sections={sections}
            onSelectRow={onSelectRow}
            initiallyFocusedOptionKey="item-0"
            ListItem={RadioListItem}
            canSelectMultiple={canSelectMultiple}
        />
    );
}

test('[SelectionList] should render 1 section and a thousand items', () => {
    measurePerformance(<SelectionListWrapper />);
});

test('[SelectionList] should press a list item', () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const scenario = async (screen: RenderResult) => {
        fireEvent.press(screen.getByText('Item 5'));
    };

    measurePerformance(<SelectionListWrapper />, {scenario});
});

test('[SelectionList] should render multiple selection and select 3 items', () => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const scenario = async (screen: RenderResult) => {
        fireEvent.press(screen.getByText('Item 1'));
        fireEvent.press(screen.getByText('Item 2'));
        fireEvent.press(screen.getByText('Item 3'));
    };

    measurePerformance(<SelectionListWrapper canSelectMultiple />, {scenario});
});

test('[SelectionList] should scroll and select a few items', () => {
    const eventData = {
        nativeEvent: {
            contentOffset: {
                y: variables.optionRowHeight * 5,
            },
            contentSize: {
                // Dimensions of the scrollable content
                height: variables.optionRowHeight * 10,
                width: 100,
            },
            layoutMeasurement: {
                // Dimensions of the device
                height: variables.optionRowHeight * 5,
                width: 100,
            },
        },
    };

    // eslint-disable-next-line @typescript-eslint/require-await
    const scenario = async (screen: RenderResult) => {
        fireEvent.press(screen.getByText('Item 1'));
        // see https://github.com/callstack/react-native-testing-library/issues/1540
        fireEvent(screen.getByTestId('selection-list'), 'onContentSizeChange', eventData.nativeEvent.contentSize.width, eventData.nativeEvent.contentSize.height);
        fireEvent.scroll(screen.getByTestId('selection-list'), eventData);
        fireEvent.press(screen.getByText('Item 7'));
        fireEvent.press(screen.getByText('Item 15'));
    };

    measurePerformance(<SelectionListWrapper canSelectMultiple />, {scenario});
});
