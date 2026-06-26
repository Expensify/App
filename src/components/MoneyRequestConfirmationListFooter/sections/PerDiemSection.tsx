import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import PerDiemFields from '@components/MoneyRequestConfirmationList/sections/PerDiemFields';
import {perDiemSliceSelector} from '@components/MoneyRequestConfirmationList/sections/selectors';
import useTransactionSelector from '@components/MoneyRequestConfirmationList/sections/useTransactionSelector';
import {getPerDiemCustomUnit} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

type PerDiemSectionProps = {
    /** Active policy (used to resolve the per-diem custom unit) */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Whether to display per-field validation errors */
    shouldDisplayFieldError: boolean;

    /** Form-level error message */
    formError: string;
};

/**
 * Two-level guard: the outer component checks the context-level gate (`isPerDiemRequest` + action)
 * without subscribing to anything. The inner component is the only place that subscribes to the
 * transaction slice, so non-per-diem flows avoid the extra Onyx subscriptions.
 */
function PerDiemSection({policy, shouldDisplayFieldError, formError}: PerDiemSectionProps) {
    const {action, isPerDiemRequest} = useConfirmationFields();
    if (!isPerDiemRequest || action === CONST.IOU.ACTION.SUBMIT) {
        return null;
    }
    return (
        <PerDiemSectionContent
            policy={policy}
            shouldDisplayFieldError={shouldDisplayFieldError}
            formError={formError}
        />
    );
}

function PerDiemSectionContent({policy, shouldDisplayFieldError, formError}: PerDiemSectionProps) {
    const {action, iouType, transactionID, reportID, isReadOnly, didConfirm} = useConfirmationFields();
    const transaction = useTransactionSelector(transactionID, perDiemSliceSelector);

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
