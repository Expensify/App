import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import DescriptionField from '@components/MoneyRequestConfirmationList/sections/DescriptionField';

import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type PerDiemDetailsFieldsProps = {
    /** Active policy */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Whether a description is required */
    isDescriptionRequired: boolean;
};

function PerDiemDetailsFields({policy, isDescriptionRequired}: PerDiemDetailsFieldsProps) {
    const {action, iouType, transactionID, reportID, reportActionID, isReadOnly, didConfirm, isNewManualExpenseFlowEnabled} = useConfirmationFields();

    return (
        <DescriptionField
            isNewManualExpenseFlowEnabled={isNewManualExpenseFlowEnabled}
            isReadOnly={isReadOnly}
            didConfirm={didConfirm}
            isDescriptionRequired={isDescriptionRequired}
            transactionID={transactionID}
            action={action}
            iouType={iouType}
            reportID={reportID}
            reportActionID={reportActionID}
            policy={policy}
        />
    );
}

export default PerDiemDetailsFields;
