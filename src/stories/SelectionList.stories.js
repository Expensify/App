import React, {useMemo, useState} from 'react';
import _ from 'underscore';
import {View} from 'react-native';
import SelectionList from '../components/SelectionList';
import CONST from '../CONST';
import styles from '../styles/styles';
import Text from '../components/Text';

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story = {
    title: 'Components/SelectionList',
    component: SelectionList,
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
        <SelectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            sections={sections}
            onSelectRow={onSelectRow}
        />
    );
}

Default.args = {
    sections: SECTIONS,
    onSelectRow: () => {},
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
        <SelectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            sections={sections}
            textInputValue={searchText}
            onChangeText={setSearchText}
            onSelectRow={onSelectRow}
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
    onSelectRow: () => {},
    onChangeText: () => {},
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
        <SelectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            sections={sections}
            onSelectRow={onSelectRow}
        />
    );
}

WithAlternateText.args = {
    ...Default.args,
};

function MultipleSelection(args) {
    const [selectedIds, setSelectedIds] = useState(['option-1', 'option-2']);

    const memo = useMemo(() => {
        const allIds = [];

        const sections = _.map(args.sections, (section) => {
            const data = _.map(section.data, (item, index) => {
                allIds.push(item.keyForList);
                const isSelected = _.contains(selectedIds, item.keyForList);
                const isAdmin = index + section.indexOffset === 0;

                return {
                    ...item,
                    isSelected,
                    alternateText: `${item.keyForList}@email.com`,
                    accountID: item.keyForList,
                    login: item.text,
                    rightElement: isAdmin && (
                        <View style={[styles.badge, styles.peopleBadge]}>
                            <Text style={styles.peopleBadgeText}>Admin</Text>
                        </View>
                    ),
                };
            });

            return {...section, data};
        });

        return {sections, allIds};
    }, [args.sections, selectedIds]);

    const onSelectRow = (item) => {
        const newSelectedIds = _.contains(selectedIds, item.keyForList) ? _.without(selectedIds, item.keyForList) : [...selectedIds, item.keyForList];
        setSelectedIds(newSelectedIds);
    };

    const onSelectAll = () => {
        if (selectedIds.length === memo.allIds.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(memo.allIds);
        }
    };

    return (
        <SelectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            sections={memo.sections}
            onSelectRow={onSelectRow}
            onSelectAll={onSelectAll}
        />
    );
}

MultipleSelection.args = {
    ...Default.args,
    canSelectMultiple: true,
    onSelectAll: () => {},
};

function WithSectionHeader(args) {
    const [selectedIds, setSelectedIds] = useState(['option-1', 'option-2']);

    const memo = useMemo(() => {
        const allIds = [];

        const sections = _.map(args.sections, (section, sectionIndex) => {
            const data = _.map(section.data, (item, itemIndex) => {
                allIds.push(item.keyForList);
                const isSelected = _.contains(selectedIds, item.keyForList);
                const isAdmin = itemIndex + section.indexOffset === 0;

                return {
                    ...item,
                    isSelected,
                    alternateText: `${item.keyForList}@email.com`,
                    accountID: item.keyForList,
                    login: item.text,
                    rightElement: isAdmin && (
                        <View style={[styles.badge, styles.peopleBadge]}>
                            <Text style={styles.peopleBadgeText}>Admin</Text>
                        </View>
                    ),
                };
            });

            return {...section, data, title: `Section ${sectionIndex + 1}`};
        });

        return {sections, allIds};
    }, [args.sections, selectedIds]);

    const onSelectRow = (item) => {
        const newSelectedIds = _.contains(selectedIds, item.keyForList) ? _.without(selectedIds, item.keyForList) : [...selectedIds, item.keyForList];
        setSelectedIds(newSelectedIds);
    };

    const onSelectAll = () => {
        if (selectedIds.length === memo.allIds.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(memo.allIds);
        }
    };

    return (
        <SelectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            sections={memo.sections}
            onSelectRow={onSelectRow}
            onSelectAll={onSelectAll}
        />
    );
}

WithSectionHeader.args = {
    ...MultipleSelection.args,
};

function WithConfirmButton(args) {
    const [selectedIds, setSelectedIds] = useState(['option-1', 'option-2']);

    const memo = useMemo(() => {
        const allIds = [];

        const sections = _.map(args.sections, (section, sectionIndex) => {
            const data = _.map(section.data, (item, itemIndex) => {
                allIds.push(item.keyForList);
                const isSelected = _.contains(selectedIds, item.keyForList);
                const isAdmin = itemIndex + section.indexOffset === 0;

                return {
                    ...item,
                    isSelected,
                    alternateText: `${item.keyForList}@email.com`,
                    accountID: item.keyForList,
                    login: item.text,
                    rightElement: isAdmin && (
                        <View style={[styles.badge, styles.peopleBadge]}>
                            <Text style={styles.peopleBadgeText}>Admin</Text>
                        </View>
                    ),
                };
            });

            return {...section, data, title: `Section ${sectionIndex + 1}`};
        });

        return {sections, allIds};
    }, [args.sections, selectedIds]);

    const onSelectRow = (item) => {
        const newSelectedIds = _.contains(selectedIds, item.keyForList) ? _.without(selectedIds, item.keyForList) : [...selectedIds, item.keyForList];
        setSelectedIds(newSelectedIds);
    };

    const onSelectAll = () => {
        if (selectedIds.length === memo.allIds.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(memo.allIds);
        }
    };

    return (
        <SelectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            sections={memo.sections}
            onSelectRow={onSelectRow}
            onSelectAll={onSelectAll}
        />
    );
}

WithConfirmButton.args = {
    ...MultipleSelection.args,
    onConfirm: () => {},
    confirmButtonText: 'Confirm',
};

export {Default, WithTextInput, WithHeaderMessage, WithAlternateText, MultipleSelection, WithSectionHeader, WithConfirmButton};
export default story;
