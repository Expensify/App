import {measurePerformance} from 'reassure';
import SelectionListRadio from '../../src/components/SelectionListRadio';

jest.mock('../../src/components/Icon/Expensicons');

test('render SelectionListRadio with 1 section and hundreds of items', () => {
    const sections = [
        {
            data: Array.from({length: 100}, (__, i) => ({
                text: `Item ${i}`,
                keyForList: `item-${i}`,
                isSelected: i === 0,
            })),
            indexOffset: 0,
            isDisabled: false,
        },
    ];

    measurePerformance(
        <SelectionListRadio
            textInputLabel="Perf test"
            sections={sections}
            initiallyFocusedOptionKey="item-0"
            onSelectRow={() => {}}
        />,
    );
});
