import type {Meta} from '@storybook/react-webpack5';
import React, {useMemo, useState} from 'react';
import Badge from '@components/Badge';
import Button from '@components/Button';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import SelectionList from '@components/SelectionList/SelectionListWithSections';
import type {ListItem, SelectionListWithSectionsProps} from '@components/SelectionList/SelectionListWithSections/types';
import withNavigationFallback from '@components/withNavigationFallback';
import useThemeStyles from '@hooks/useThemeStyles';

const SelectionListWithNavigation = withNavigationFallback(SelectionList);

/**
 * We use the Component Story Format for writing stories. Follow the docs here:
 *
 * https://storybook.js.org/docs/react/writing-stories/introduction#component-story-format
 */
const story: Meta<typeof SelectionList> = {
    title: 'Components/SelectionListWithSections',
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
        sectionIndex: 0,
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
        sectionIndex: 1,
    },
];

function Default(props: SelectionListWithSectionsProps<ListItem>) {
    const [selectedKey, setSelectedKey] = useState('option-2');

    const sections = props.sections.map((section) => {
        const data = section.data.map((item) => ({...item, isSelected: item.keyForList === selectedKey}));
        return {...section, data};
    });

    const onSelectRow = (item: ListItem) => {
        if (!item.keyForList) {
            return;
        }
        setSelectedKey(item.keyForList);
    };

    return (
        <SelectionListWithNavigation
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            sections={sections}
            ListItem={SingleSelectListItem}
            onSelectRow={onSelectRow}
        />
    );
}

Default.args = {
    sections: SECTIONS,
    onSelectRow: () => {},
    initiallyFocusedItemKey: 'option-2',
};

function WithTextInput(props: SelectionListWithSectionsProps<ListItem>) {
    const [searchText, setSearchText] = useState('');
    const [selectedKey, setSelectedKey] = useState('option-2');

    const sections = props.sections.map((section) => {
        const data = section.data.reduce<ListItem[]>((memo, item) => {
            if (!item.text?.toLowerCase().includes(searchText.trim().toLowerCase())) {
                return memo;
            }
            memo.push({...item, isSelected: item.keyForList === selectedKey});
            return memo;
        }, []);

        return {...section, data};
    });

    const onSelectRow = (item: ListItem) => {
        if (!item.keyForList) {
            return;
        }
        setSelectedKey(item.keyForList);
    };

    return (
        <SelectionListWithNavigation
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            sections={sections}
            ListItem={SingleSelectListItem}
            onSelectRow={onSelectRow}
            shouldShowTextInput
            textInputOptions={{
                label: 'Option list',
                placeholder: 'Search something...',
                value: searchText,
                onChangeText: setSearchText,
            }}
        />
    );
}

WithTextInput.args = {
    sections: SECTIONS,
    initiallyFocusedItemKey: 'option-2',
    onSelectRow: () => {},
};

function WithAlternateText(props: SelectionListWithSectionsProps<ListItem>) {
    const [selectedKey, setSelectedKey] = useState('option-2');

    const sections = props.sections.map((section) => {
        const data = section.data.map((item, index) => ({
            ...item,
            alternateText: `Alternate ${index + 1}`,
            isSelected: item.keyForList === selectedKey,
        }));

        return {...section, data};
    });

    const onSelectRow = (item: ListItem) => {
        if (!item.keyForList) {
            return;
        }
        setSelectedKey(item.keyForList);
    };

    return (
        <SelectionListWithNavigation
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            sections={sections}
            onSelectRow={onSelectRow}
            ListItem={SingleSelectListItem}
        />
    );
}

WithAlternateText.args = {
    ...Default.args,
};

function MultipleSelection(props: SelectionListWithSectionsProps<ListItem>) {
    const [selectedIds, setSelectedIds] = useState(['option-1', 'option-2']);
    const styles = useThemeStyles();

    const sections = props.sections.map((section) => {
        const data = section.data.map((item, index) => {
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
                        textStyles={styles.textStrong}
                        badgeStyles={styles.alignSelfCenter}
                    />
                ),
            };
        });

        return {...section, data};
    });

    const onSelectRow = (item: ListItem) => {
        if (!item.keyForList) {
            return;
        }
        const newSelectedIds = selectedIds.includes(item.keyForList) ? selectedIds.filter((id) => id !== item.keyForList) : [...selectedIds, item.keyForList];
        setSelectedIds(newSelectedIds);
    };

    return (
        <SelectionListWithNavigation
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            sections={sections}
            ListItem={MultiSelectListItem}
            onSelectRow={onSelectRow}
        />
    );
}

MultipleSelection.args = {
    ...Default.args,
    canSelectMultiple: true,
};

function WithSectionHeader(props: SelectionListWithSectionsProps<ListItem>) {
    const [selectedIds, setSelectedIds] = useState(['option-1', 'option-2']);
    const styles = useThemeStyles();

    const sections = props.sections.map((section, sectionIndex) => {
        const data = section.data.map((item, itemIndex) => {
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
                        textStyles={styles.textStrong}
                        badgeStyles={styles.alignSelfCenter}
                    />
                ),
            };
        });

        return {...section, data, title: `Section ${sectionIndex + 1}`};
    });

    const onSelectRow = (item: ListItem) => {
        if (!item.keyForList) {
            return;
        }
        const newSelectedIds = selectedIds.includes(item.keyForList) ? selectedIds.filter((id) => id !== item.keyForList) : [...selectedIds, item.keyForList];
        setSelectedIds(newSelectedIds);
    };

    return (
        <SelectionListWithNavigation
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            sections={sections}
            ListItem={MultiSelectListItem}
            onSelectRow={onSelectRow}
        />
    );
}

WithSectionHeader.args = {
    ...MultipleSelection.args,
};

function WithConfirmButton(props: SelectionListWithSectionsProps<ListItem>) {
    const [selectedIds, setSelectedIds] = useState(['option-1', 'option-2']);
    const styles = useThemeStyles();

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
                            textStyles={styles.textStrong}
                            badgeStyles={styles.alignSelfCenter}
                        />
                    ),
                };
            });

            return {...section, data, title: `Section ${sectionIndex + 1}`};
        });

        return {sections, allIds};
    }, [props.sections, selectedIds, styles.alignSelfCenter, styles.textStrong]);

    const onSelectRow = (item: ListItem) => {
        if (!item.keyForList) {
            return;
        }
        const newSelectedIds = selectedIds.includes(item.keyForList) ? selectedIds.filter((id) => id !== item.keyForList) : [...selectedIds, item.keyForList];
        setSelectedIds(newSelectedIds);
    };

    return (
        <SelectionListWithNavigation
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            sections={memo.sections}
            ListItem={MultiSelectListItem}
            onSelectRow={onSelectRow}
            footerContent={
                <Button
                    success
                    text="Confirm"
                    onPress={() => {}}
                />
            }
        />
    );
}

WithConfirmButton.args = {
    ...MultipleSelection.args,
};

export {Default, WithTextInput, WithAlternateText, MultipleSelection, WithSectionHeader, WithConfirmButton};
export default story;
