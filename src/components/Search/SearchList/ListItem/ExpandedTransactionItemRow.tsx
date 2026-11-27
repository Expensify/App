import TransactionItemRow from '@components/TransactionItemRow';
import type {TransactionItemRowProps} from '@components/TransactionItemRow/types';

import useOnyx from '@hooks/useOnyx';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

type ExpandedTransactionItemRowProps = TransactionItemRowProps & {
    policyID: string | undefined;
};

function ExpandedTransactionItemRow({policyID, ...rowProps}: ExpandedTransactionItemRowProps) {
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(policyID)}`);
    const [policyTagLists] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(policyID)}`);

    return (
        <TransactionItemRow
            {...rowProps}
            policyCategories={policyCategories}
            policyTagLists={policyTagLists}
        />
    );
}

export default ExpandedTransactionItemRow;
