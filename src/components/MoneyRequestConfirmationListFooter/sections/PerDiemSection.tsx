import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import PerDiemFields from '@components/MoneyRequestConfirmationList/sections/PerDiemFields';
import {getPerDiemCustomUnit} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

type PerDiemSectionProps = {
    /** Action being performed (per-diem fields are hidden on SUBMIT) */
    action: IOUAction;

    /** Type of IOU being confirmed */
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** Whether the active transaction is a per-diem request (gate for rendering this section) */
    isPerDiemRequest: boolean;

    /** Active transaction */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** ID of the report the transaction belongs to */
    reportID: string;

    /** ID of the active transaction */
    transactionID: string | undefined;

    /** Active policy (used to resolve the per-diem custom unit) */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Whether the surface is read-only */
    isReadOnly: boolean;

    /** Whether the user has confirmed (locks editable controls) */
    didConfirm: boolean;

    /** Whether to display per-field validation errors */
    shouldDisplayFieldError: boolean;

    /** Form-level error message */
    formError: string;
};

function PerDiemSection({action, iouType, isPerDiemRequest, transaction, reportID, transactionID, policy, isReadOnly, didConfirm, shouldDisplayFieldError, formError}: PerDiemSectionProps) {
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
