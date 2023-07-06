import React, {useState} from 'react';
import {measurePerformance} from 'reassure';
import {fireEvent} from '@testing-library/react-native';
import SelectionListRadio from '../../src/components/SelectionListRadio';

jest.mock('../../src/components/Icon/Expensicons');

function SelectionListRadioWrapper() {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const sections = [
        {
            data: Array.from({length: 1000}, (__, i) => ({
                text: `Item ${i}`,
                keyForList: `item-${i}`,
                isSelected: selectedIndex === i,
            })),
            indexOffset: 0,
            isDisabled: false,
        },
    ];

    const onSelectRow = (item) => {
        const index = Number(item.keyForList.split('-')[1]);
        setSelectedIndex(index);
    };

    return (
        <SelectionListRadio
            textInputLabel="Perf test"
            sections={sections}
            onSelectRow={onSelectRow}
            initiallyFocusedOptionKey="item-0"
        />
    );
}

test('should render SelectionListRadio with 1 section and a thousand items', () => {
    measurePerformance(<SelectionListRadioWrapper />);
});

test('should press a list item', () => {
    const scenario = (screen) => {
        fireEvent.press(screen.getByText('Item 5'));
    };

    measurePerformance(<SelectionListRadioWrapper />, {scenario});
});
