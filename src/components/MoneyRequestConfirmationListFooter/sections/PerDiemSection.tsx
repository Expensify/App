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
    /** Whether the active transaction is a per-diem request (gate for rendering this section) */
    isPerDiemRequest: boolean;

    /** Active policy (used to resolve the per-diem custom unit) */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Whether to display per-field validation errors */
    shouldDisplayFieldError: boolean;

    /** Form-level error message */
    formError: string;
};

type PerDiemSectionContentProps = Omit<PerDiemSectionProps, 'isPerDiemRequest'>;

/**
 * Two-level guard: the outer component checks the prop-level gate (`isPerDiemRequest` + action)
 * without subscribing to anything. The inner component is the only place that subscribes to the
 * transaction slice, so non-per-diem flows avoid the extra Onyx subscriptions.
 */
function PerDiemSection({isPerDiemRequest, policy, shouldDisplayFieldError, formError}: PerDiemSectionProps) {
    const {action} = useConfirmationFields();
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

function PerDiemSectionContent({policy, shouldDisplayFieldError, formError}: PerDiemSectionContentProps) {
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
