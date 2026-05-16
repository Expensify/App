import React from 'react';
import TextCell from '@components/Search/SearchList/ListItem/TextCell';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionWithOptionalSearchFields} from '../types';

type CategoryGLCodeCellProps = {
    transactionItem: TransactionWithOptionalSearchFields;
    policyID?: string;
};

function CategoryGLCodeCell({transactionItem, policyID}: CategoryGLCodeCellProps) {
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID ?? ''}`);
    const glCode = policyCategories?.[transactionItem.category ?? '']?.['GL Code'] ?? '';

    return <TextCell text={glCode} />;
}

export default CategoryGLCodeCell;
