import {fireEvent} from '@testing-library/react-native';
import React, {useState} from 'react';
import {measurePerformance} from 'reassure';
import _ from 'underscore';
import SelectionList from '../../src/components/SelectionList';
import CONST from '../../src/CONST';
import variables from '../../src/styles/variables';

jest.mock('../../src/components/Icon/Expensicons');

jest.mock('../../src/hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn(),
    })),
);

jest.mock('../../src/components/withLocalize', () => (Component) => {
    function WrappedComponent(props) {
        return (
            <Component
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                translate={() => ''}
            />
        );
    }
    WrappedComponent.displayName = `WrappedComponent`;
    return WrappedComponent;
});

jest.mock('../../src/hooks/useNetwork', () =>
    jest.fn(() => ({
        isOffline: false,
    })),
);

jest.mock('../../src/components/withKeyboardState', () => (Component) => {
    function WrappedComponent(props) {
        return (
            <Component
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                isKeyboardShown={false}
            />
        );
    }
    WrappedComponent.displayName = `WrappedComponent`;
    return WrappedComponent;
});

jest.mock('@react-navigation/native', () => ({
    useFocusEffect: () => {},
    useIsFocused: () => true,
    createNavigationContainerRef: jest.fn(),
}));

function SelectionListWrapper(args) {
    const [selectedIds, setSelectedIds] = useState([]);

    const sections = [
        {
            data: Array.from({length: 1000}, (__, i) => ({
                text: `Item ${i}`,
                keyForList: `item-${i}`,
                isSelected: _.contains(selectedIds, `item-${i}`),
            })),
            indexOffset: 0,
            isDisabled: false,
        },
    ];

    const onSelectRow = (item) => {
        if (args.canSelectMultiple) {
            if (_.contains(selectedIds, item.keyForList)) {
                setSelectedIds(_.without(selectedIds, item.keyForList));
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
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
        />
    );
}

const runs = CONST.PERFORMANCE_TESTS.RUNS;

test('[SelectionList] should render 1 section and a thousand items', () => {
    measurePerformance(<SelectionListWrapper />);
});

test('[SelectionList] should press a list item', () => {
    const scenario = (screen) => {
        fireEvent.press(screen.getByText('Item 5'));
    };

    measurePerformance(<SelectionListWrapper />, {scenario, runs});
});

test('[SelectionList] should render multiple selection and select 3 items', () => {
    const scenario = (screen) => {
        fireEvent.press(screen.getByText('Item 1'));
        fireEvent.press(screen.getByText('Item 2'));
        fireEvent.press(screen.getByText('Item 3'));
    };

    measurePerformance(<SelectionListWrapper canSelectMultiple />, {scenario, runs});
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

    const scenario = (screen) => {
        fireEvent.press(screen.getByText('Item 1'));
        // see https://github.com/callstack/react-native-testing-library/issues/1540
        fireEvent(screen.getByTestId('selection-list'), 'onContentSizeChange', eventData.nativeEvent.contentSize.width, eventData.nativeEvent.contentSize.height);
        fireEvent.scroll(screen.getByTestId('selection-list'), eventData);
        fireEvent.press(screen.getByText('Item 7'));
        fireEvent.press(screen.getByText('Item 15'));
    };

    measurePerformance(<SelectionListWrapper canSelectMultiple />, {scenario, runs});
});
