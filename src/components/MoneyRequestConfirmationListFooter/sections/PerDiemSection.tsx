import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import PerDiemFields from '@components/MoneyRequestConfirmationList/sections/PerDiemFields';
import {getPerDiemCustomUnit} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

type PerDiemSectionProps = {
    /** Whether the active transaction is a per-diem request (gate for rendering this section) */
    isPerDiemRequest: boolean;

    /** Active transaction */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** Active policy (used to resolve the per-diem custom unit) */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Whether to display per-field validation errors */
    shouldDisplayFieldError: boolean;

    /** Form-level error message */
    formError: string;
};

function PerDiemSection({isPerDiemRequest, transaction, policy, shouldDisplayFieldError, formError}: PerDiemSectionProps) {
    const {action, iouType, transactionID, reportID, isReadOnly, didConfirm} = useConfirmationFields();
    if (!isPerDiemRequest || action === CONST.IOU.ACTION.SUBMIT) {
        return null;
    }

    const perDiemCustomUnit = getPerDiemCustomUnit(policy);

    return (
        <PerDiemFields
            perDiemCustomUnit={perDiemCustomUnit}
            transaction={transaction}
            isReadOnly={isReadOnly}
            didConfirm={didConfirm}
            transactionID={transactionID}
            action={action}
            iouType={iouType}
            reportID={reportID}
            shouldDisplayFieldError={shouldDisplayFieldError}
            formError={formError}
        />
    );
}

export default PerDiemSection;
