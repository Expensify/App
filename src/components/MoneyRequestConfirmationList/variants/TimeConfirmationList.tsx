import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationListData from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import TimeFooter from '@components/MoneyRequestConfirmationListFooter/variants/TimeFooter';

import React from 'react';
import {View} from 'react-native';

/**
 * Confirms a time expense being created.
 *
 * Only the CREATE action reaches this. Outside CREATE a time expense shows Merchant and hides the hours/rate
 * fields, which is what the manual confirmation renders anyway.
 */
function TimeConfirmationList(props: MoneyRequestConfirmationListProps) {
    const data = useConfirmationListData({...props, isTimeRequest: true});

    const listFooterContent = (
        <ConfirmationFieldsProvider
            {...data.confirmationFieldsProviderProps}
            isTimeRequest
        >
            <View>
                <TimeFooter {...data.footerProps} />
            </View>
        </ConfirmationFieldsProvider>
    );

    return (
        <>
            <FieldAutoSelector {...data.fieldAutoSelectProps} />
            <ConfirmationListLayout
                {...data.layoutProps}
                listFooterContent={listFooterContent}
            />
        </>
    );
}

export default TimeConfirmationList;
