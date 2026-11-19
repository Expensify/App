import AnchoredSelectionListPopover from '@components/AnchoredSelectionListPopover';
import type {AnchoredSelectionListPopoverProps} from '@components/AnchoredSelectionListPopover';

import useOnyx from '@hooks/useOnyx';

import {getCountOfEnabledTagsOfList, getTagList} from '@libs/PolicyUtils';
import type {OptionData} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useState} from 'react';

import TagPicker from '.';

type TagPickerModalProps = {
    /** The policy whose tags should be shown */
    policyID: string | undefined;

    selectedTag?: string;

    /** The current transaction tag of the expense */
    transactionTag?: string;

    /** Whether the policy has dependent tags */
    hasDependentTags?: boolean;

    /** Optional override for whether to show GL codes under each tag */
    shouldShowGLCode?: boolean;

    /** Called when the user confirms a tag selection */
    onSelected?: (tag: string) => void;

    /** Index of the tag list to show. Defaults to the first list */
    tagListIndex?: number;

    /** Number of enabled tags at which the search input appears. The content height estimate uses the same value. */
    searchInputThreshold?: number;
} & Omit<AnchoredSelectionListPopoverProps, 'optionCount' | 'isSearchable' | 'title' | 'backButtonSentryLabel' | 'headerActions' | 'children'>;

function TagPickerModal({
    policyID,
    selectedTag = '',
    transactionTag,
    hasDependentTags,
    shouldShowGLCode,
    onSelected,
    tagListIndex = 0,
    searchInputThreshold = CONST.STANDARD_LIST_ITEM_LIMIT,
    onClose,
    ...popoverProps
}: TagPickerModalProps) {
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const [renderedRowCount, setRenderedRowCount] = useState<number>();
    const policyTagList = getTagList(policyTags, tagListIndex);
    const tagsCount = getCountOfEnabledTagsOfList(policyTagList.tags);

    const handleTagSelected = (item: Partial<OptionData>) => {
        // If clicking the same tag that's already selected, treat it as deselection
        if (item.keyForList === selectedTag) {
            onSelected?.('');
        } else {
            onSelected?.(item.searchText ?? item.text ?? '');
        }
        onClose();
    };

    return (
        <AnchoredSelectionListPopover
            {...popoverProps}
            onClose={onClose}
            optionCount={renderedRowCount ?? tagsCount}
            isSearchable={tagsCount >= searchInputThreshold}
            title={policyTagList.name}
            backButtonSentryLabel={CONST.SENTRY_LABEL.TAG_PICKER_MODAL.BACK_BUTTON}
        >
            <TagPicker
                onRenderedRowCountChange={setRenderedRowCount}
                policyID={policyID}
                tagListName={policyTagList.name}
                tagListIndex={tagListIndex}
                selectedTag={selectedTag}
                transactionTag={transactionTag}
                hasDependentTags={hasDependentTags}
                shouldShowGLCode={shouldShowGLCode}
                onSubmit={handleTagSelected}
                shouldAutoFocusSearchInput
                searchInputThreshold={searchInputThreshold}
            />
        </AnchoredSelectionListPopover>
    );
}

export default TagPickerModal;
