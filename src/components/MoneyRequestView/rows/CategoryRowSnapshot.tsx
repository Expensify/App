import React from 'react';
import {useSnapshotTransactionField} from '@components/MoneyRequestView/contexts/SnapshotTransactionProvider';
import FieldRow from '@components/MoneyRequestView/FieldRow';
import useLocalize from '@hooks/useLocalize';
import {getDecodedCategoryName, isCategoryMissing} from '@libs/CategoryUtils';
import type {Transaction} from '@src/types/onyx';

function CategoryRowSnapshot() {
    const {translate} = useLocalize();
    const category = useSnapshotTransactionField((tx: Transaction) => tx?.category ?? '');

    if (!category || isCategoryMissing(category)) {
        return null;
    }

    return (
        <FieldRow
            description={translate('common.category')}
            title={getDecodedCategoryName(category)}
            numberOfLinesTitle={2}
            interactive={false}
            shouldShowRightIcon={false}
        />
    );
}

export default CategoryRowSnapshot;
