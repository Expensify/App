import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import PerDiemFields from '@components/MoneyRequestConfirmationList/sections/PerDiemFields';
import {perDiemSliceSelector} from '@components/MoneyRequestConfirmationList/sections/selectors';
import useTransactionSelector from '@components/MoneyRequestConfirmationList/sections/useTransactionSelector';

import {getPerDiemCustomUnit} from '@libs/PolicyUtils';

import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type PerDiemSectionProps = {
    /** Active policy (used to resolve the per-diem custom unit) */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Whether to display per-field validation errors */
    shouldDisplayFieldError: boolean;

    /** Form-level error message */
    formError: string;
};

function PerDiemSection({policy, shouldDisplayFieldError, formError}: PerDiemSectionProps) {
    const {transactionID, isReadOnly, didConfirm} = useConfirmationFields();
    const transaction = useTransactionSelector(transactionID, perDiemSliceSelector);

    const perDiemCustomUnit = getPerDiemCustomUnit(policy);

    return (
        <PerDiemFields
            perDiemCustomUnit={perDiemCustomUnit}
            transaction={transaction}
            isReadOnly={isReadOnly}
            didConfirm={didConfirm}
            transactionID={transactionID}
            shouldDisplayFieldError={shouldDisplayFieldError}
            formError={formError}
        />
    );
}

export default PerDiemSection;
