import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import usePolicyTagsForConfirmation from '@components/MoneyRequestConfirmationList/hooks/usePolicyTagsForConfirmation';
import TagPickerModal from '@components/TagPicker/TagPickerModal';

import useOnyx from '@hooks/useOnyx';
import useUpdateTransactionTag from '@hooks/useUpdateTransactionTag';

import {getTag} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import type {ExpenseFieldDropdownRenderProps} from './ExpenseFieldDropdown';

import {transactionTagSelector} from './selectors';
import useTransactionSelector from './useTransactionSelector';

type TagFieldDropdownProps = ExpenseFieldDropdownRenderProps & {
    /** ID of the expense the picked tag is written to */
    transactionID: string;

    /** Policy the tags belong to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Index of the tag list this row picks from */
    tagListIndex: number;
};

/**
 * One tag list, in the container anchored to its row on the expense form. Mounted only once the row is opened, and
 * saves through the same hook the full-page selector uses so both leave the expense in the same state.
 */
function TagFieldDropdown({transactionID, policy, tagListIndex, onClose, ...popoverProps}: TagFieldDropdownProps) {
    const {reportID, isEditingSplitBill, action} = useConfirmationFields();
    const {policyTags} = usePolicyTagsForConfirmation(policy?.id);
    const transactionTag = useTransactionSelector(transactionID, transactionTagSelector) ?? '';

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`);

    const {updateTag} = useUpdateTransactionTag({
        transactionID,
        transaction: draftTransaction ?? transaction,
        report,
        policy,
        policyTags,
        tagListIndex,
        isEditing: action === CONST.IOU.ACTION.EDIT,
        isEditingSplit: isEditingSplitBill,
    });

    return (
        <TagPickerModal
            {...popoverProps}
            onClose={onClose}
            shouldFitContentHeight
            shouldShowHeader
            policyID={policy?.id}
            tagListIndex={tagListIndex}
            selectedTag={getTag({tag: transactionTag}, tagListIndex)}
            transactionTag={transactionTag}
            onSelected={updateTag}
        />
    );
}

export default TagFieldDropdown;
