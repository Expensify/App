import type {ExpenseFieldDropdownRenderProps} from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';
import TagPickerModal from '@components/TagPicker/TagPickerModal';

import useOnyx from '@hooks/useOnyx';
import useUpdateTransactionTag from '@hooks/useUpdateTransactionTag';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getTag} from '@libs/TransactionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type TagFieldDropdownProps = ExpenseFieldDropdownRenderProps & {
    /** ID of the expense the picked value is written to */
    transactionID: string;

    /** Expense the picked tag is written to */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Transaction thread report of the expense */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** Policy the tags belong to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Index of the tag list this row picks from */
    tagListIndex: number;
};

/**
 * One tag list, anchored to its row on a saved expense. Mounted only once the row is opened, and saves through the
 * same hook the full-page selector uses.
 */
function TagFieldDropdown({transactionID, transaction, transactionThreadReport, policy, tagListIndex, onClose, ...popoverProps}: TagFieldDropdownProps) {
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(policy?.id)}`);
    const transactionTag = getTag(transaction);

    const {updateTag} = useUpdateTransactionTag({
        transactionID,
        transaction,
        report: transactionThreadReport,
        policy,
        policyTags,
        tagListIndex,
        isEditing: true,
        isEditingSplit: false,
    });

    return (
        <TagPickerModal
            {...popoverProps}
            onClose={onClose}
            shouldFitContentHeight
            shouldShowHeader
            policyID={policy?.id}
            tagListIndex={tagListIndex}
            selectedTag={getTag(transaction, tagListIndex)}
            transactionTag={transactionTag}
            onSelected={updateTag}
        />
    );
}

export default TagFieldDropdown;
