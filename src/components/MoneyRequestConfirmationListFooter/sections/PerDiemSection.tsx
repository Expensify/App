import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import PerDiemFields from '@components/MoneyRequestConfirmationList/sections/PerDiemFields';
import {getPerDiemCustomUnit} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import type {IOUAction, IOUType} from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

type PerDiemSectionProps = {
    action: IOUAction;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    isPerDiemRequest: boolean;
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    reportID: string;
    transactionID: string | undefined;
    policy: OnyxEntry<OnyxTypes.Policy>;
    isReadOnly: boolean;
    didConfirm: boolean;
    shouldDisplayFieldError: boolean;
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
