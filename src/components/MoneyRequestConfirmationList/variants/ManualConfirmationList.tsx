import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationListData from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import SplitBillController from '@components/MoneyRequestConfirmationList/SplitBillController';
import TaxController from '@components/MoneyRequestConfirmationList/TaxController';
import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import ManualFooter from '@components/MoneyRequestConfirmationListFooter/variants/ManualFooter';

import React from 'react';

/**
 * Confirms a manually entered expense.It also serves pay, per diem being moved off a track expense,
 * and a time expense outside CREATE, all of which confirm as a plain expense.
 */
function ManualConfirmationList(props: MoneyRequestConfirmationListProps) {
    const {isPerDiemRequest, isTimeRequest} = props;

    const data = useConfirmationListData(props);

    return (
        <ConfirmationListLayout
            {...data.layoutProps}
            fieldFlags={{isPerDiemRequest, isTimeRequest}}
            listFooterContent={<ManualFooter {...data.footerProps} />}
        >
            <TaxController {...data.taxControllerProps} />
            <SplitBillController {...data.splitBillControllerProps} />
            <FieldAutoSelector {...data.fieldAutoSelectProps} />
        </ConfirmationListLayout>
    );
}

export default ManualConfirmationList;
