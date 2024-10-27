import React, {useMemo, useState} from 'react';
import {OnyxEntry, useOnyx} from 'react-native-onyx';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import type * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTag, PolicyTags, Transaction} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

type SelectedTagOption = {
    name: string;
    enabled: boolean;
    isSelected?: boolean;
    accountID: number | undefined;
    pendingAction?: PendingAction;
};

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

    /** Indicates which tag list index was selected */
    tagListIndex: number;

    /** Current Transaction */
    currentTransaction: OnyxEntry<Transaction>;
};

function TagPicker({selectedTag, tagListName, policyID, tagListIndex, shouldShowDisabledAndSelectedOption = false, onSubmit, currentTransaction}: TagPickerProps) {
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const [policyRecentlyUsedTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchValue, setSearchValue] = useState('');

    const policyRecentlyUsedTagsList = useMemo(() => policyRecentlyUsedTags?.[tagListName] ?? [], [policyRecentlyUsedTags, tagListName]);
    const policyTagList = PolicyUtils.getTagList(policyTags, tagListIndex);
    const policyTagsCount = PolicyUtils.getCountOfEnabledTagsOfList(policyTagList.tags);
    const isTagsCountBelowThreshold = policyTagsCount < CONST.TAG_LIST_THRESHOLD;

    const shouldShowTextInput = !isTagsCountBelowThreshold;
    const currentlySelectedTag = TransactionUtils.getTagUptoIndex(currentTransaction, tagListIndex);
    const hasDependentTags = useMemo(() => PolicyUtils.hasDependentTags(policy, policyTags), [policy, policyTags]);

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
            // we should only filter according to the parentTagsFilter when we have dependent tag and we are not on the first parent tag
            return hasDependentTags && !!currentlySelectedTag
                ? Object.values(policyTagList.tags).filter((tag) => {
                      // Make sure to return the comparison result
                      return tag.rules?.parentTagsFilter === `^${currentlySelectedTag.replace(',', '\\:')}$`;
                  })
                : policyTagList.tags;
        }
        const selectedNames = selectedOptions.map((s) => s.name);

        return [...selectedOptions, ...Object.values(policyTagList.tags).filter((policyTag) => policyTag.enabled && !selectedNames.includes(policyTag.name))];
    }, [selectedOptions, policyTagList, shouldShowDisabledAndSelectedOption]);

    const sections = useMemo(
        () =>
            OptionsListUtils.getFilteredOptions({
                searchValue,
                selectedOptions,
                includeP2P: false,
                includeTags: true,
                tags: enabledTags,
                recentlyUsedTags: policyRecentlyUsedTagsList,
                canInviteUser: false,
            }).tagOptions,
        [searchValue, enabledTags, selectedOptions, policyRecentlyUsedTagsList],
    );

    const headerMessage = OptionsListUtils.getHeaderMessageForNonUserList((sections?.at(0)?.data?.length ?? 0) > 0, searchValue);

    const selectedOptionKey = sections.at(0)?.data?.filter((policyTag) => policyTag.searchText === selectedTag)?.[0]?.keyForList;

    return (
        <SelectionList
            ListItem={RadioListItem}
            sectionTitleStyles={styles.mt5}
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
