import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
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

import React, {useMemo, useState} from 'react';

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

    /**
     * Extra tag names to always surface as selectable options, on top of the policy's own tags.
     * Used to keep "orphaned" tags from a deleted source workspace selectable in flows like
     * split-edit where the active workspace no longer carries the original tag value.
     */
    additionalTagsToInclude?: string[];
};

const getSelectedOptions = (selectedTag: string): SelectedTagOption[] => {
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
    additionalTagsToInclude,
}: TagPickerProps) {
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const [policyRecentlyUsedTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`);
    const styles = useThemeStyles();
    const {inputCallbackRef} = useAutoFocusInput();
    const {translate, localeCompare} = useLocalize();
    const [searchValue, setSearchValue] = useState('');

    const policyRecentlyUsedTagsList = useMemo(() => policyRecentlyUsedTags?.[tagListName] ?? [], [policyRecentlyUsedTags, tagListName]);
    const policyTagList = getTagList(policyTags, tagListIndex);
    const selectedOptions = getSelectedOptions(selectedTag);

    // Merge any orphaned tag names into the policy's tag map so they appear as selectable options.
    const policyTagsWithAdditions = useMemo<PolicyTags>(() => {
        const baseTags = policyTagList.tags ?? {};
        if (!additionalTagsToInclude?.length) {
            return baseTags;
        }
        const extras: PolicyTags = {};
        for (const name of additionalTagsToInclude) {
            if (!name || baseTags[name]) {
                continue;
            }
            extras[name] = {name, enabled: true} as PolicyTag;
        }
        return Object.keys(extras).length ? {...baseTags, ...extras} : baseTags;
    }, [policyTagList.tags, additionalTagsToInclude]);

    const getEnabledTags = (): PolicyTags | Array<PolicyTag | SelectedTagOption> => {
        if (!shouldShowDisabledAndSelectedOption && !hasDependentTags) {
            return policyTagsWithAdditions;
        }

        if (!shouldShowDisabledAndSelectedOption && hasDependentTags) {
            // Truncate transactionTag to the current level (e.g., "California:North")
            const parentTag = getTagArrayFromName(transactionTag ?? '')
                .slice(0, tagListIndex)
                .join(':');

            return Object.values(policyTagsWithAdditions).filter((policyTag) => {
                const filterRegex = policyTag.rules?.parentTagsFilter;
                if (!filterRegex) {
                    return policyTagsWithAdditions;
                }

                const regex = new RegExp(filterRegex);
                return regex.test(parentTag ?? '');
            });
        }

        const selectedNames = new Set(selectedOptions.map((s) => s.name));

        return [...selectedOptions, ...Object.values(policyTagsWithAdditions).filter((policyTag) => policyTag.enabled && !selectedNames.has(policyTag.name))];
    };

    const enabledTags = getEnabledTags();
    const enabledTagsList = Array.isArray(enabledTags) ? enabledTags : Object.values(enabledTags ?? {});
    const availableTagsCount = enabledTagsList.filter((tag) => tag.enabled).length;

    const tagSections = getTagListSections({
        searchValue,
        selectedOptions,
        tags: enabledTags,
        recentlyUsedTags: policyRecentlyUsedTagsList,
        localeCompare,
        translate,
    });
    const sections = shouldOrderListByTagName
        ? tagSections.map((option) => ({
              ...option,
              data: option.data.sort((a, b) => localeCompare(a.text ?? '', b.text ?? '')),
          }))
        : tagSections;

    const selectedOptionKey = sections.at(0)?.data?.find((policyTag) => policyTag.searchText === selectedTag)?.keyForList;

    const textInputOptions = {
        value: searchValue,
        onChangeText: setSearchValue,
        headerMessage: getHeaderMessageForNonUserList((sections?.at(0)?.data?.length ?? 0) > 0, searchValue),
        label: translate('common.search'),
        disableAutoFocus: true,
        ref: inputCallbackRef as (ref: BaseTextInputRef | null) => void,
    };

    return (
        <SelectionListWithSections
            sections={sections}
            ListItem={SingleSelectListItem}
            style={{
                sectionTitleStyles: styles.mt5,
                listItemTitleStyles: styles.w100,
            }}
            textInputOptions={textInputOptions}
            shouldShowTextInput={availableTagsCount >= CONST.STANDARD_LIST_ITEM_LIMIT}
            initiallyFocusedItemKey={selectedOptionKey}
            onSelectRow={onSubmit}
            isRowMultilineSupported
            titleNumberOfLines={CONST.TRANSACTION_TAG_AND_CATEGORY_PICKER_MAX_TITLE_LINES}
        />
    );
}

export default TagPicker;
