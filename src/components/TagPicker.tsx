import React, {useMemo, useState} from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getHeaderMessageForNonUserList} from '@libs/OptionsListUtils';
import {getTagList} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';
import type {SelectedTagOption} from '@libs/TagsOptionsListUtils';
import {getTagListSections} from '@libs/TagsOptionsListUtils';
import {getTagArrayFromName} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTag, PolicyTags} from '@src/types/onyx';
// eslint-disable-next-line no-restricted-imports
import SelectionList from './SelectionListWithSections';
import RadioListItem from './SelectionListWithSections/RadioListItem';

type TagPickerProps = {
    /** The policyID we are getting tags for */
    policyID: string | undefined;

    /** The selected tag of the expense */
    selectedTag: string;

    /** The current transaction tag of the expense */
    transactionTag?: string;

    /** Whether the policy has dependent tags */
    hasDependentTags?: boolean;

    /** The name of tag list we are getting tags for */
    tagListName: string;

    /** Callback to submit the selected tag */
    onSubmit: (selectedTag: Partial<OptionData>) => void;

    /** Should show the selected option that is disabled? */
    shouldShowDisabledAndSelectedOption?: boolean;

    /** Whether the list should be sorted by tag name. default is false */
    shouldOrderListByTagName?: boolean;

    /** Indicates which tag list index was selected */
    tagListIndex: number;
};

function TagPicker({
    selectedTag,
    transactionTag,
    hasDependentTags,
    tagListName,
    policyID,
    tagListIndex,
    shouldShowDisabledAndSelectedOption = false,
    shouldOrderListByTagName = false,
    onSubmit,
}: TagPickerProps) {
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`, {canBeMissing: true});
    const [policyRecentlyUsedTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`, {canBeMissing: true});
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [searchValue, setSearchValue] = useState('');

    const policyRecentlyUsedTagsList = useMemo(() => policyRecentlyUsedTags?.[tagListName] ?? [], [policyRecentlyUsedTags, tagListName]);
    const policyTagList = getTagList(policyTags, tagListIndex);

    const selectedOptions: SelectedTagOption[] = useMemo(() => {
        if (!selectedTag) {
            return [];
        }

        return [
            {
                name: selectedTag,
                enabled: true,
                accountID: undefined,
            },
        ];
    }, [selectedTag]);

    const enabledTags: PolicyTags | Array<PolicyTag | SelectedTagOption> = useMemo(() => {
        if (!shouldShowDisabledAndSelectedOption && !hasDependentTags) {
            return policyTagList.tags;
        }

        if (!shouldShowDisabledAndSelectedOption && hasDependentTags) {
            // Truncate transactionTag to the current level (e.g., "California:North")
            const parentTag = getTagArrayFromName(transactionTag ?? '')
                .slice(0, tagListIndex)
                .join(':');

            return Object.values(policyTagList.tags).filter((policyTag) => {
                const filterRegex = policyTag.rules?.parentTagsFilter;
                if (!filterRegex) {
                    return policyTagList.tags;
                }

                const regex = new RegExp(filterRegex);
                return regex.test(parentTag ?? '');
            });
        }

        const selectedNames = new Set(selectedOptions.map((s) => s.name));

        return [...selectedOptions, ...Object.values(policyTagList.tags).filter((policyTag) => policyTag.enabled && !selectedNames.has(policyTag.name))];
    }, [shouldShowDisabledAndSelectedOption, hasDependentTags, selectedOptions, policyTagList.tags, transactionTag, tagListIndex]);

    const availableTagsCount = useMemo(() => {
        if (Array.isArray(enabledTags)) {
            return enabledTags.filter((tag) => tag.enabled).length;
        }

        return Object.values(enabledTags ?? {}).filter((tag) => tag.enabled).length;
    }, [enabledTags]);
    const shouldShowTextInput = availableTagsCount >= CONST.STANDARD_LIST_ITEM_LIMIT;

    const sections = useMemo(() => {
        const tagSections = getTagListSections({
            searchValue,
            selectedOptions,
            tags: enabledTags,
            recentlyUsedTags: policyRecentlyUsedTagsList,
            localeCompare,
            translate,
        });
        return shouldOrderListByTagName
            ? tagSections.map((option) => ({
                  ...option,
                  data: option.data.sort((a, b) => localeCompare(a.text ?? '', b.text ?? '')),
              }))
            : tagSections;
    }, [searchValue, selectedOptions, enabledTags, policyRecentlyUsedTagsList, localeCompare, translate, shouldOrderListByTagName]);

    const headerMessage = getHeaderMessageForNonUserList((sections?.at(0)?.data?.length ?? 0) > 0, searchValue);

    const selectedOptionKey = sections.at(0)?.data?.find((policyTag) => policyTag.searchText === selectedTag)?.keyForList;

    const listItemTitleStyles = [styles.breakAll, styles.w100];

    return (
        <SelectionList
            ListItem={RadioListItem}
            sectionTitleStyles={styles.mt5}
            listItemTitleStyles={listItemTitleStyles}
            sections={sections}
            textInputValue={searchValue}
            headerMessage={headerMessage}
            textInputLabel={shouldShowTextInput ? translate('common.search') : undefined}
            initiallyFocusedOptionKey={selectedOptionKey}
            onChangeText={setSearchValue}
            onSelectRow={onSubmit}
        />
    );
}

export default TagPicker;

export type {SelectedTagOption};
