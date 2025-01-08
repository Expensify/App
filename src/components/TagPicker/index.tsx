import React, {useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import type * as ReportUtils from '@libs/ReportUtils';
import type {SelectedTagOption} from '@libs/TagsOptionsListUtils';
import * as TagOptionListUtils from '@libs/TagsOptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTag, PolicyTags} from '@src/types/onyx';

type TagPickerProps = {
    /** The policyID we are getting tags for */
    // It's used in withOnyx HOC.
    // eslint-disable-next-line react/no-unused-prop-types
    policyID: string;

    /** The selected tag of the expense */
    selectedTag: string;

    /** The name of tag list we are getting tags for */
    tagListName: string;

    /** Callback to submit the selected tag */
    onSubmit: (selectedTag: Partial<ReportUtils.OptionData>) => void;

    /** Should show the selected option that is disabled? */
    shouldShowDisabledAndSelectedOption?: boolean;

    /** Whether the list should be sorted by tag name. default is false */
    shouldOrderListByTagName?: boolean;

    /** Indicates which tag list index was selected */
    tagListIndex: number;
};

function TagPicker({selectedTag, tagListName, policyID, tagListIndex, shouldShowDisabledAndSelectedOption = false, shouldOrderListByTagName = false, onSubmit}: TagPickerProps) {
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const [policyRecentlyUsedTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');

    const policyRecentlyUsedTagsList = useMemo(() => policyRecentlyUsedTags?.[tagListName] ?? [], [policyRecentlyUsedTags, tagListName]);
    const policyTagList = PolicyUtils.getTagList(policyTags, tagListIndex);
    const policyTagsCount = PolicyUtils.getCountOfEnabledTagsOfList(policyTagList.tags);
    const isTagsCountBelowThreshold = policyTagsCount < CONST.STANDARD_LIST_ITEM_LIMIT;

    const shouldShowTextInput = !isTagsCountBelowThreshold;

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
        if (!shouldShowDisabledAndSelectedOption) {
            return policyTagList.tags;
        }
        const selectedNames = selectedOptions.map((s) => s.name);

        return [...selectedOptions, ...Object.values(policyTagList.tags).filter((policyTag) => policyTag.enabled && !selectedNames.includes(policyTag.name))];
    }, [selectedOptions, policyTagList, shouldShowDisabledAndSelectedOption]);

    const sections = useMemo(() => {
        const tagSections = TagOptionListUtils.getTagListSections({
            searchValue,
            selectedOptions,
            tags: enabledTags,
            recentlyUsedTags: policyRecentlyUsedTagsList,
        });
        return shouldOrderListByTagName
            ? tagSections.map((option) => ({
                  ...option,
                  data: option.data.sort((a, b) => a.text?.localeCompare(b.text ?? '') ?? 0),
              }))
            : tagSections;
    }, [searchValue, selectedOptions, enabledTags, policyRecentlyUsedTagsList, shouldOrderListByTagName]);

    const headerMessage = OptionsListUtils.getHeaderMessageForNonUserList((sections?.at(0)?.data?.length ?? 0) > 0, searchValue);

    const selectedOptionKey = sections.at(0)?.data?.filter((policyTag) => policyTag.searchText === selectedTag)?.[0]?.keyForList;

    return (
        <SelectionList
            ListItem={RadioListItem}
            sectionTitleStyles={styles.mt5}
            listItemTitleStyles={styles.breakAll}
            sections={sections}
            textInputValue={searchValue}
            headerMessage={headerMessage}
            textInputLabel={shouldShowTextInput ? translate('common.search') : undefined}
            isRowMultilineSupported
            initiallyFocusedOptionKey={selectedOptionKey}
            onChangeText={setSearchValue}
            onSelectRow={onSubmit}
        />
    );
}

TagPicker.displayName = 'TagPicker';

export default TagPicker;

export type {SelectedTagOption};
