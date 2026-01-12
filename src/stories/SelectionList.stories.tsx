import type {Meta} from '@storybook/react-webpack5';
import React, {useMemo, useState} from 'react';
import Badge from '@components/Badge';
// eslint-disable-next-line no-restricted-imports
import SelectionList from '@components/SelectionListWithSections';
import RadioListItem from '@components/SelectionListWithSections/RadioListItem';
import type {ListItem, SelectionListProps} from '@components/SelectionListWithSections/types';
import withNavigationFallback from '@components/withNavigationFallback';
// eslint-disable-next-line no-restricted-imports
import {defaultStyles} from '@styles/index';
import CONST from '@src/CONST';

const SelectionListWithNavigation = withNavigationFallback(SelectionList);

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof SelectionList> = {
    title: 'Components/SelectionList',
    component: SelectionList,
    parameters: {
        docs: {
            source: {
                type: 'code',
            },
        },
    },
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
        isDisabled: false,
    },
];

function Default(props: SelectionListProps<ListItem>) {
    const [selectedIndex, setSelectedIndex] = useState(1);

    const sections = props.sections.map((section) => {
        const data = section.data.map((item, index) => {
            const isSelected = selectedIndex === index;
            return {...item, isSelected};
        });

        return {...section, data};
    });

    const onSelectRow = (item: ListItem) => {
        for (const section of sections) {
            const newSelectedIndex = section.data.findIndex((option) => option.keyForList === item.keyForList);

            if (newSelectedIndex >= 0) {
                setSelectedIndex(newSelectedIndex);
            }
        }
    };

    return (
        <SelectionListWithNavigation
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            sections={sections}
            ListItem={RadioListItem}
            onSelectRow={onSelectRow}
        />
    );
}

Default.args = {
    sections: SECTIONS,
    onSelectRow: () => {},
    initiallyFocusedOptionKey: 'option-2',
};

function WithTextInput(props: SelectionListProps<ListItem>) {
    const [searchText, setSearchText] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(1);

    const sections = props.sections.map((section) => {
        const data = section.data.reduce<ListItem[]>((memo, item, index) => {
            if (!item.text?.toLowerCase().includes(searchText.trim().toLowerCase())) {
                return memo;
            }

            const isSelected = selectedIndex === index;
            memo.push({...item, isSelected});
            return memo;
        }, []);

        return {...section, data};
    });

    const onSelectRow = (item: ListItem) => {
        for (const section of sections) {
            const newSelectedIndex = section.data.findIndex((option) => option.keyForList === item.keyForList);

            if (newSelectedIndex >= 0) {
                setSelectedIndex(newSelectedIndex);
            }
        }
    };

    return (
        <SelectionListWithNavigation
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            sections={sections}
            ListItem={RadioListItem}
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
    inputMode: CONST.INPUT_MODE.NUMERIC,
    initiallyFocusedOptionKey: 'option-2',
    onSelectRow: () => {},
    onChangeText: () => {},
};

function WithHeaderMessage(props: SelectionListProps<ListItem>) {
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

function WithAlternateText(props: SelectionListProps<ListItem>) {
    const [selectedIndex, setSelectedIndex] = useState(1);

    const sections = props.sections.map((section) => {
        const data = section.data.map((item, index) => {
            const isSelected = selectedIndex === index;

            return {
                ...item,
                alternateText: `Alternate ${index + 1}`,
                isSelected,
            };
        });

        return {...section, data};
    });

    const onSelectRow = (item: ListItem) => {
        for (const section of sections) {
            const newSelectedIndex = section.data.findIndex((option) => option.keyForList === item.keyForList);

            if (newSelectedIndex >= 0) {
                setSelectedIndex(newSelectedIndex);
            }
        }
    };
    return (
        <SelectionListWithNavigation
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            sections={sections}
            onSelectRow={onSelectRow}
            ListItem={RadioListItem}
        />
    );
}

WithAlternateText.args = {
    ...Default.args,
};

function MultipleSelection(props: SelectionListProps<ListItem>) {
    const [selectedIds, setSelectedIds] = useState(['option-1', 'option-2']);

    const memo = useMemo(() => {
        const allIds: string[] = [];

        const sections = props.sections.map((section) => {
            const data = section.data.map((item, index) => {
                if (item.keyForList) {
                    allIds.push(item.keyForList);
                }
                const isSelected = item.keyForList ? selectedIds.includes(item.keyForList) : false;
                const isAdmin = index === 0;

                return {
                    ...item,
                    isSelected,
                    alternateText: `${item.keyForList}@email.com`,
                    accountID: Number(item.keyForList),
                    login: item.text,
                    rightElement: isAdmin && (
                        <Badge
                            text="Admin"
                            textStyles={defaultStyles.textStrong}
                            badgeStyles={defaultStyles.badgeBordered}
                        />
                    ),
                };
            });

            return {...section, data};
        });

        return {sections, allIds};
    }, [props.sections, selectedIds]);

    const onSelectRow = (item: ListItem) => {
        if (!item.keyForList) {
            return;
        }
        const newSelectedIds = selectedIds.includes(item.keyForList) ? selectedIds.filter((id) => id !== item.keyForList) : [...selectedIds, item.keyForList];
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
        <SelectionListWithNavigation
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            sections={memo.sections}
            ListItem={RadioListItem}
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

function WithSectionHeader(props: SelectionListProps<ListItem>) {
    const [selectedIds, setSelectedIds] = useState(['option-1', 'option-2']);

    const memo = useMemo(() => {
        const allIds: string[] = [];

        const sections = props.sections.map((section, sectionIndex) => {
            const data = section.data.map((item, itemIndex) => {
                if (item.keyForList) {
                    allIds.push(item.keyForList);
                }
                const isSelected = item.keyForList ? selectedIds.includes(item.keyForList) : false;
                const isAdmin = itemIndex === 0;

                return {
                    ...item,
                    isSelected,
                    alternateText: `${item.keyForList}@email.com`,
                    accountID: Number(item.keyForList),
                    login: item.text,
                    rightElement: isAdmin && (
                        <Badge
                            text="Admin"
                            textStyles={defaultStyles.textStrong}
                            badgeStyles={defaultStyles.badgeBordered}
                        />
                    ),
                };
            });

            return {...section, data, title: `Section ${sectionIndex + 1}`};
        });

        return {sections, allIds};
    }, [props.sections, selectedIds]);

    const onSelectRow = (item: ListItem) => {
        if (!item.keyForList) {
            return;
        }
        const newSelectedIds = selectedIds.includes(item.keyForList) ? selectedIds.filter((id) => id !== item.keyForList) : [...selectedIds, item.keyForList];
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
        <SelectionListWithNavigation
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            sections={memo.sections}
            ListItem={RadioListItem}
            onSelectRow={onSelectRow}
            onSelectAll={onSelectAll}
        />
    );
}

WithSectionHeader.args = {
    ...MultipleSelection.args,
};

function WithConfirmButton(props: SelectionListProps<ListItem>) {
    const [selectedIds, setSelectedIds] = useState(['option-1', 'option-2']);

    const memo = useMemo(() => {
        const allIds: string[] = [];

        const sections = props.sections.map((section, sectionIndex) => {
            const data = section.data.map((item, itemIndex) => {
                if (item.keyForList) {
                    allIds.push(item.keyForList);
                }
                const isSelected = item.keyForList ? selectedIds.includes(item.keyForList) : false;
                const isAdmin = itemIndex === 0;

                return {
                    ...item,
                    isSelected,
                    alternateText: `${item.keyForList}@email.com`,
                    accountID: Number(item.keyForList),
                    login: item.text,
                    rightElement: isAdmin && (
                        <Badge
                            text="Admin"
                            textStyles={defaultStyles.textStrong}
                            badgeStyles={defaultStyles.badgeBordered}
                        />
                    ),
                };
            });

            return {...section, data, title: `Section ${sectionIndex + 1}`};
        });

        return {sections, allIds};
    }, [props.sections, selectedIds]);

    const onSelectRow = (item: ListItem) => {
        if (!item.keyForList) {
            return;
        }
        const newSelectedIds = selectedIds.includes(item.keyForList) ? selectedIds.filter((id) => id !== item.keyForList) : [...selectedIds, item.keyForList];
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
        <SelectionListWithNavigation
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            sections={memo.sections}
            ListItem={RadioListItem}
            onSelectRow={onSelectRow}
            onSelectAll={onSelectAll}
        />
    );
}

WithConfirmButton.args = {
    ...MultipleSelection.args,
    onConfirm: () => {},
    confirmButtonText: 'Confirm',
    showConfirmButton: true,
};

export {Default, WithTextInput, WithHeaderMessage, WithAlternateText, MultipleSelection, WithSectionHeader, WithConfirmButton};
export default story;
