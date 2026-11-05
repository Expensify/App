import type {ExpenseFieldDropdownRenderProps} from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import TagPickerModal from '@components/TagPicker/TagPickerModal';

import useOnyx from '@hooks/useOnyx';

import {updateBulkEditDraftTransaction} from '@libs/actions/IOU/BulkEdit';
import {getTagArrayFromName} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import {getBulkEditTagChange} from './SearchEditMultipleUtils';

const hasMultipleTagListsSelector = (policy: OnyxEntry<Policy>) => policy?.hasMultipleTagLists ?? false;

type SearchEditMultipleTagDropdownProps = ExpenseFieldDropdownRenderProps & {
    /** Workspace the tags belong to */
    policyID: string | undefined;

    /** Index of the tag list this row picks from */
    tagListIndex: number;
};

/**
 * One tag list, in the container anchored to its row on the bulk edit form. Mounted only once the row is opened, and
 * records the pick on the draft the same way the full-page selector does. Dependent tags keep the full page, so the
 * draft's tag is read as-is here.
 */
function SearchEditMultipleTagDropdown({policyID, tagListIndex, onClose, ...popoverProps}: SearchEditMultipleTagDropdownProps) {
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`);
    const [hasMultipleTagLists] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {selector: hasMultipleTagListsSelector});
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);

    const transactionTag = draftTransaction?.tag ?? '';
    const currentTag = getTagArrayFromName(transactionTag).at(tagListIndex) ?? '';

    const saveTag = (selectedTagName: string) => {
        updateBulkEditDraftTransaction(
            getBulkEditTagChange({
                // The list hands back an empty name when the picked tag is tapped again, which the helper reads as a clear.
                selectedTagName: selectedTagName || currentTag,
                currentTag,
                tagListIndex,
                transactionTag,
                recordedTagChanges: draftTransaction?.bulkEditTagChanges ?? {},
                policyTags,
                hasDependentTags: false,
                hasMultipleTagLists: hasMultipleTagLists ?? false,
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
