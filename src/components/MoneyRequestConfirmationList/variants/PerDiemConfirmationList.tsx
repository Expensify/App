import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ConfirmationListLayout from '@components/MoneyRequestConfirmationList/ConfirmationListLayout';
import FieldAutoSelector from '@components/MoneyRequestConfirmationList/FieldAutoSelector';
import useConfirmationListData from '@components/MoneyRequestConfirmationList/hooks/useConfirmationListData';
import type {MoneyRequestConfirmationListProps} from '@components/MoneyRequestConfirmationList/types';
import PerDiemFooter from '@components/MoneyRequestConfirmationListFooter/variants/PerDiemFooter';

import React from 'react';
import {View} from 'react-native';

/** Confirms a per-diem expense. */
function PerDiemConfirmationList(props: MoneyRequestConfirmationListProps) {
    const data = useConfirmationListData({...props, isPerDiemRequest: true});

    const listFooterContent = (
        <ConfirmationFieldsProvider
            {...data.confirmationFieldsProviderProps}
            isPerDiemRequest
        >
            <View>
                <PerDiemFooter {...data.footerProps} />
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

export default PerDiemConfirmationList;
