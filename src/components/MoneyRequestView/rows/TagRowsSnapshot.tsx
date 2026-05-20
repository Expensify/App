import React from 'react';
import {useSnapshotTransactionField} from '@components/MoneyRequestView/contexts/SnapshotTransactionProvider';
import {useTransactionPolicyID} from '@components/MoneyRequestView/contexts/TransactionPolicyContext';
import FieldRow from '@components/MoneyRequestView/FieldRow';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getTagLists} from '@libs/PolicyUtils';
import {getTagForDisplay} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

function TagRowsSnapshot() {
    const {translate} = useLocalize();
    const transaction = useSnapshotTransactionField((tx: Transaction) => tx);
    const policyID = useTransactionPolicyID();
    const [policyTagList] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const policyTagLists = getTagLists(policyTagList);

    if (!transaction?.tag || policyTagLists.length === 0) {
        return null;
    }

    return (
        <>
            {policyTagLists.map(({name}, index) => {
                const tagForDisplay = getTagForDisplay(transaction, index);
                if (!tagForDisplay) {
                    return null;
                }
                return (
                    <FieldRow
                        key={name}
                        description={name ?? translate('common.tag')}
                        title={tagForDisplay}
                        numberOfLinesTitle={2}
                        interactive={false}
                        shouldShowRightIcon={false}
                    />
                );
            })}
        </>
    );
}

export default TagRowsSnapshot;
