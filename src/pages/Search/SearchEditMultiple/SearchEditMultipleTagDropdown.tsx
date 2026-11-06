import type {ExpenseFieldDropdownRenderProps} from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import TagPickerModal from '@components/TagPicker/TagPickerModal';

import {updateBulkEditDraftTransaction} from '@libs/actions/IOU/BulkEdit';
import {getTagArrayFromName} from '@libs/TransactionUtils';

import type {PolicyTagLists} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import {getBulkEditTagChange} from './SearchEditMultipleUtils';

type SearchEditMultipleTagDropdownProps = ExpenseFieldDropdownRenderProps & {
    /** Workspace the tags belong to */
    policyID: string | undefined;

    /** Index of the tag list this row picks from */
    tagListIndex: number;

    /** The whole multi-level tag the draft shows */
    transactionTag: string;

    /** The per-level tag changes already recorded on the draft, which drive the save */
    recordedTagChanges: Record<string, string | null>;

    policyTags: OnyxEntry<PolicyTagLists>;
    hasMultipleTagLists: boolean;
};

/**
 * One tag list, in the container anchored to its row on the bulk edit form. Mounted only once the row is opened, and
 * records the pick on the draft the same way the full-page selector does. Dependent tags keep the full page, so the
 * draft's tag is read as-is here.
 */
function SearchEditMultipleTagDropdown({
    policyID,
    tagListIndex,
    transactionTag,
    recordedTagChanges,
    policyTags,
    hasMultipleTagLists,
    onClose,
    ...popoverProps
}: SearchEditMultipleTagDropdownProps) {
    const currentTag = getTagArrayFromName(transactionTag).at(tagListIndex) ?? '';

    const saveTag = (selectedTagName: string) => {
        updateBulkEditDraftTransaction(
            getBulkEditTagChange({
                // The list hands back an empty name when the picked tag is tapped again, which the helper reads as a clear.
                selectedTagName: selectedTagName || currentTag,
                currentTag,
                tagListIndex,
                transactionTag,
                recordedTagChanges,
                policyTags,
                hasDependentTags: false,
                hasMultipleTagLists,
            }),
        );
    };

    return (
        <TagPickerModal
            {...popoverProps}
            onClose={onClose}
            shouldFitContentHeight
            shouldShowHeader
            policyID={policyID}
            tagListIndex={tagListIndex}
            selectedTag={currentTag}
            transactionTag={transactionTag}
            onSelected={saveTag}
        />
    );
}

export default SearchEditMultipleTagDropdown;
