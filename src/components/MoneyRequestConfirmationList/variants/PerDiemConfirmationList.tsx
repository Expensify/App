import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationListData from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import PerDiemFooter from '@components/MoneyRequestConfirmationListFooter/variants/PerDiemFooter';

import React from 'react';

/** Confirms a per-diem expense. */
function PerDiemConfirmationList(props: MoneyRequestConfirmationListProps) {
    const data = useConfirmationListData({...props, isPerDiemRequest: true});

    return (
        <ConfirmationListLayout
            {...data.layoutProps}
            fieldFlags={{isPerDiemRequest: true}}
            listFooterContent={<PerDiemFooter {...data.footerProps} />}
        >
            <FieldAutoSelector {...data.fieldAutoSelectProps} />
        </ConfirmationListLayout>
    );
}

export default PerDiemConfirmationList;
