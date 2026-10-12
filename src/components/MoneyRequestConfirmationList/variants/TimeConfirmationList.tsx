import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationListData from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import TimeFooter from '@components/MoneyRequestConfirmationListFooter/variants/TimeFooter';

import React from 'react';

/**
 * Confirms a time expense being created.
 *
 * Only the CREATE action reaches this. Outside CREATE a time expense shows Merchant and hides the hours/rate
 * fields, which is what the manual confirmation renders anyway.
 */
function TimeConfirmationList(props: MoneyRequestConfirmationListProps) {
    const data = useConfirmationListData({...props, isTimeRequest: true});

    return (
        <ConfirmationListLayout
            {...data.layoutProps}
            fieldFlags={{isTimeRequest: true}}
            listFooterContent={<TimeFooter {...data.footerProps} />}
        >
            <FieldAutoSelector {...data.fieldAutoSelectProps} />
        </ConfirmationListLayout>
    );
}

export default TimeConfirmationList;
