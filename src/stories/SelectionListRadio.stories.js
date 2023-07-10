import React, {useState} from 'react';
import _ from 'underscore';
import SelectionListRadio from '../components/SelectionListRadio';
import CONST from '../CONST';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/SelectionListRadio',
    component: SelectionListRadio,
};

const SECTIONS = [
    {
        data: [
            {
                text: 'Option 1',
                keyForList: 'option-1',
                isSelected: false,
            },
            {
                text: 'Option 2',
                keyForList: 'option-2',
                isSelected: false,
            },
            {
                text: 'Option 3',
                keyForList: 'option-3',
                isSelected: false,
            },
        ],
        indexOffset: 0,
        isDisabled: false,
    },
    {
        data: [
            {
                text: 'Option 4',
                keyForList: 'option-4',
                isSelected: false,
            },
            {
                text: 'Option 5',
                keyForList: 'option-5',
                isSelected: false,
            },
            {
                text: 'Option 6',
                keyForList: 'option-6',
                isSelected: false,
            },
        ],
        indexOffset: 3,
        isDisabled: false,
    },
];

function Default(args) {
    const [selectedIndex, setSelectedIndex] = useState(1);

    const sections = _.map(args.sections, (section) => {
        const data = _.map(section.data, (item, index) => {
            const isSelected = selectedIndex === index + section.indexOffset;
            return {...item, isSelected};
        });

        return {...section, data};
    });

    const onSelectRow = (item) => {
        _.forEach(sections, (section) => {
            const newSelectedIndex = _.findIndex(section.data, (option) => option.keyForList === item.keyForList);

            if (newSelectedIndex >= 0) {
                setSelectedIndex(newSelectedIndex + section.indexOffset);
            }
        });
    };

    return (
        <SelectionListRadio
            onSelectRow={onSelectRow}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            sections={sections}
        />
    );
}

Default.args = {
    sections: SECTIONS,
    initiallyFocusedOptionKey: 'option-2',
};

function WithTextInput(args) {
    const [searchText, setSearchText] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(1);

    const sections = _.map(args.sections, (section) => {
        const data = _.reduce(
            section.data,
            (memo, item, index) => {
                if (!item.text.toLowerCase().includes(searchText.trim().toLowerCase())) {
                    return memo;
                }

                const isSelected = selectedIndex === index + section.indexOffset;
                memo.push({...item, isSelected});
                return memo;
            },
            [],
        );

        return {...section, data};
    });

    const onSelectRow = (item) => {
        _.forEach(sections, (section) => {
            const newSelectedIndex = _.findIndex(section.data, (option) => option.keyForList === item.keyForList);

            if (newSelectedIndex >= 0) {
                setSelectedIndex(newSelectedIndex + section.indexOffset);
            }
        });
    };

    return (
        <SelectionListRadio
            textInputValue={searchText}
            onChangeText={setSearchText}
            onSelectRow={onSelectRow}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            sections={sections}
        />
    );
}

WithTextInput.args = {
    sections: SECTIONS,
    textInputLabel: 'Option list',
    textInputPlaceholder: 'Search something...',
    textInputMaxLength: 4,
    keyboardType: CONST.KEYBOARD_TYPE.NUMBER_PAD,
    initiallyFocusedOptionKey: 'option-2',
};

function WithHeaderMessage(props) {
    return (
        <WithTextInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

WithHeaderMessage.args = {
    ...WithTextInput.args,
    headerMessage: 'No results found',
    sections: [],
};

function WithAlternateText(args) {
    const [selectedIndex, setSelectedIndex] = useState(1);

    const sections = _.map(args.sections, (section) => {
        const data = _.map(section.data, (item, index) => {
            const isSelected = selectedIndex === index + section.indexOffset;

            return {
                ...item,
                alternateText: `Alternate ${index + 1}`,
                isSelected,
            };
        });

        return {...section, data};
    });

    const onSelectRow = (item) => {
        _.forEach(sections, (section) => {
            const newSelectedIndex = _.findIndex(section.data, (option) => option.keyForList === item.keyForList);

            if (newSelectedIndex >= 0) {
                setSelectedIndex(newSelectedIndex + section.indexOffset);
            }
        });
    };
    return (
        <SelectionListRadio
            onSelectRow={onSelectRow}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            sections={sections}
        />
    );
}

WithAlternateText.args = {
    ...Default.args,
};

export {Default, WithTextInput, WithHeaderMessage, WithAlternateText};
export default story;
