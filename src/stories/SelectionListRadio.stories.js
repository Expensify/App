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

const ITEMS = [
    {
        text: 'Option 1',
        keyForList: 'option-1',
    },
    {
        text: 'Option 2',
        keyForList: 'option-2',
    },
    {
        text: 'Option 3',
        keyForList: 'option-3',
    },
];

function Default(props) {
    const [selectedIndex, setSelectedIndex] = useState(1);

    const data = _.map(ITEMS, (item, index) => {
        const isSelected = index === selectedIndex;

        return {
            ...item,
            isSelected,
        };
    });

    const onSelectRow = (item) => {
        const newSelectedIndex = _.findIndex(data, (option) => option.keyForList === item.keyForList);
        setSelectedIndex(newSelectedIndex);
    };

    return (
        <SelectionListRadio
            sections={[{data, indexOffset: 0, isDisabled: false}]}
            onSelectRow={onSelectRow}
            initiallyFocusedOptionKey={_.get(_.filter(data, (item, index) => index === selectedIndex)[0], 'keyForList')}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

Default.args = {};

function WithTextInput(props) {
    const [searchText, setSearchText] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(1);

    const data = _.reduce(
        ITEMS,
        (memo, item, index) => {
            if (!item.text.toLowerCase().includes(searchText.trim().toLowerCase())) {
                return memo;
            }

            const isSelected = index === selectedIndex;
            memo.push({...item, isSelected});
            return memo;
        },
        [],
    );

    const onSelectRow = (item) => {
        const newSelectedIndex = _.findIndex(data, (option) => option.keyForList === item.keyForList);
        setSelectedIndex(newSelectedIndex);
    };

    return (
        <SelectionListRadio
            textInputValue={searchText}
            onChangeText={setSearchText}
            sections={[{data, indexOffset: 0, isDisabled: false}]}
            onSelectRow={onSelectRow}
            initiallyFocusedOptionKey={_.get(_.filter(data, (item, index) => index === selectedIndex)[0], 'keyForList')}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

WithTextInput.args = {
    textInputLabel: 'Option list',
    textInputPlaceholder: 'Search something...',
    textInputMaxLength: 4,
    keyboardType: CONST.KEYBOARD_TYPE.NUMBER_PAD,
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

function WithAlternateText(props) {
    const [selectedIndex, setSelectedIndex] = useState(1);

    const data = _.map(ITEMS, (item, index) => {
        const isSelected = index === selectedIndex;

        return {
            ...item,
            alternateText: `Alternate ${index + 1}`,
            isSelected,
        };
    });

    const onSelectRow = (item) => {
        const newSelectedIndex = _.findIndex(data, (option) => option.keyForList === item.keyForList);
        setSelectedIndex(newSelectedIndex);
    };

    return (
        <SelectionListRadio
            sections={[{data, indexOffset: 0, isDisabled: false}]}
            onSelectRow={onSelectRow}
            initiallyFocusedOptionKey={_.get(_.filter(data, (item, index) => index === selectedIndex)[0], 'keyForList')}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

WithAlternateText.args = {
    ...Default.args,
};

export default story;
export {Default, WithTextInput, WithHeaderMessage, WithAlternateText};
