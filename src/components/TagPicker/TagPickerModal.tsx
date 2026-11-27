import AnchoredSelectionListPopover from '@components/AnchoredSelectionListPopover';
import type {AnchoredSelectionListPopoverProps} from '@components/AnchoredSelectionListPopover';

import usePickerPopoverRowCount from '@hooks/usePickerPopoverRowCount';
import usePickerPopoverSession from '@hooks/usePickerPopoverSession';

import type {OptionData} from '@libs/ReportUtils';

import CONST from '@src/CONST';

import React, {useState} from 'react';

import {getTagPickerOptions, TagPickerList, useTagPickerData} from '.';

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
    onSelected?: (tag: string) => void | Promise<void>;

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
    isVisible,
    onClose,
    onModalHide,
    ...popoverProps
}: TagPickerModalProps) {
    const {searchKey, shouldPrepareOptions, finishClosing} = usePickerPopoverSession(isVisible, onModalHide);
    const data = useTagPickerData({policyID, tagListIndex});
    const options = shouldPrepareOptions ? getTagPickerOptions(data, {selectedTag, transactionTag, hasDependentTags, shouldShowGLCode, tagListIndex, searchInputThreshold}) : undefined;
    const {rowCount, setRowCountFrozen, unfilteredSections} = usePickerPopoverRowCount(options ? () => options.getSections('') : undefined, searchKey);
    const [search, setSearch] = useState({searchKey, value: ''});
    const searchValue = search.searchKey === searchKey ? search.value : '';
    const sections = searchValue ? options?.getSections(searchValue) : unfilteredSections;
    const setSearchValue = (value: string) => {
        setSearch({searchKey, value});
        setRowCountFrozen(!!value);
    };

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
            isVisible={isVisible}
            onClose={onClose}
            onModalHide={finishClosing}
            optionCount={rowCount}
            isSearchable={options?.hasSearchablePolicyTags ?? false}
            title={data.policyTagList.name}
            backButtonSentryLabel={CONST.SENTRY_LABEL.TAG_PICKER_MODAL.BACK_BUTTON}
        >
            {options && sections && (
                <TagPickerList
                    options={options}
                    sections={sections}
                    searchValue={searchValue}
                    setSearchValue={setSearchValue}
                    policyID={policyID}
                    selectedTag={selectedTag}
                    onSubmit={handleTagSelected}
                    shouldAutoFocusSearchInput
                />
            )}
        </AnchoredSelectionListPopover>
    );
}

export default TagPickerModal;
