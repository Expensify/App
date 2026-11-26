import AnchoredSelectionListPopover from '@components/AnchoredSelectionListPopover';
import type {AnchoredSelectionListPopoverProps} from '@components/AnchoredSelectionListPopover';

import useLocalize from '@hooks/useLocalize';
import usePickerPopoverRowCount from '@hooks/usePickerPopoverRowCount';
import usePickerPopoverSession from '@hooks/usePickerPopoverSession';

import type {OptionData} from '@libs/ReportUtils';

import CONST from '@src/CONST';

import React from 'react';

import {getTagPickerModel, TagPickerSearch, useTagPickerData} from '.';
import {buildTagPickerSections} from './TagPickerResults';

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
    isVisible,
    onClose,
    onModalHide,
    ...popoverProps
}: TagPickerModalProps) {
    const {searchKey, shouldPrepareOptions, finishClosing} = usePickerPopoverSession(isVisible, onModalHide);
    const data = useTagPickerData({policyID, tagListIndex, shouldLoadTags: shouldPrepareOptions});
    const {translate, localeCompare} = useLocalize();
    const model = shouldPrepareOptions ? getTagPickerModel(data, {selectedTag, transactionTag, hasDependentTags, shouldShowGLCode, tagListIndex, searchInputThreshold}) : undefined;
    const {rowCount, setRowCountFrozen, unfilteredSections} = usePickerPopoverRowCount(
        model && !model.isLoading ? () => buildTagPickerSections(model, '', {translate, localeCompare}) : undefined,
        searchKey,
    );

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
            isSearchable={model?.hasSearchablePolicyTags ?? false}
            title={data.policyTagList.name}
            backButtonSentryLabel={CONST.SENTRY_LABEL.TAG_PICKER_MODAL.BACK_BUTTON}
        >
            {model && (
                <TagPickerSearch
                    key={searchKey}
                    model={model}
                    unfilteredSections={unfilteredSections}
                    setRowCountFrozen={setRowCountFrozen}
                    onSubmit={handleTagSelected}
                    shouldAutoFocusSearchInput
                />
            )}
        </AnchoredSelectionListPopover>
    );
}

export default TagPickerModal;
