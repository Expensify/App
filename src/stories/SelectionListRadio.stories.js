import React, {useState} from 'react';
import _ from 'underscore';
import SelectionListRadio from '../components/SelectionListRadio';
import * as Expensicons from '../components/Icon/Expensicons';
import themeColors from '../styles/themes/default';
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
        boldStyle: false,
        keyForList: 'option-1',
    },
    {
        text: 'Option 2',
        boldStyle: false,
        keyForList: 'option-2',
    },
    {
        text: 'Option 3',
        boldStyle: false,
        keyForList: 'option-3',
    },
];

const Default = (props) => {
    const [selectedIndex, setSelectedIndex] = useState(1);

    const data = _.map(ITEMS, (item, index) => {
        const isSelected = index === selectedIndex;

        return {
            ...item,
            boldStyle: isSelected,
            customIcon: isSelected ? {src: Expensicons.Checkmark, color: themeColors.success} : undefined,
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
};

Default.args = {};

const WithTextInput = (props) => {
    const [searchText, setSearchText] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(1);

    const data = _.reduce(
        ITEMS,
        (memo, item, index) => {
            if (!item.text.toLowerCase().includes(searchText.trim().toLowerCase())) {
                return memo;
            }

            const isSelected = index === selectedIndex;

            memo.push({
                ...item,
                boldStyle: isSelected,
                customIcon: isSelected ? {src: Expensicons.Checkmark, color: themeColors.success} : undefined,
            });

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
};

WithTextInput.args = {
    textInputLabel: 'Option list',
    textInputPlaceholder: 'Search something...',
    textInputMaxLength: 4,
    keyboardType: CONST.KEYBOARD_TYPE.NUMBER_PAD,
};

const WithHeaderMessage = (props) => (
    <WithTextInput
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
);

WithHeaderMessage.args = {
    ...WithTextInput.args,
    headerMessage: 'No results found',
    sections: [],
};

const WithAlternateText = (props) => {
    const [selectedIndex, setSelectedIndex] = useState(1);

    const data = _.map(ITEMS, (item, index) => {
        const isSelected = index === selectedIndex;

        return {
            ...item,
            boldStyle: isSelected,
            customIcon: isSelected ? {src: Expensicons.Checkmark, color: themeColors.success} : undefined,
            alternateText: `Alternate ${index + 1}`,
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
};

WithAlternateText.args = {
    ...Default.args,
};

export default story;
export {Default, WithTextInput, WithHeaderMessage, WithAlternateText};
