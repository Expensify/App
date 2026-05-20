import React from 'react';
import {useSnapshotTransactionField} from '@components/MoneyRequestView/contexts/SnapshotTransactionProvider';
import FieldRow from '@components/MoneyRequestView/FieldRow';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useLocalize from '@hooks/useLocalize';
import {enrichAndSortAttendees} from '@libs/AttendeeUtils';
import {getAttendeesListDisplayString} from '@libs/TransactionUtils';
import type {Transaction} from '@src/types/onyx';

function AttendeesRowSnapshot() {
    const {translate, localeCompare} = useLocalize();
    const personalDetailsList = usePersonalDetails();
    const transaction = useSnapshotTransactionField((tx: Transaction) => tx);
    const attendees = enrichAndSortAttendees(transaction?.comment?.attendees, personalDetailsList, localeCompare);

    if (!Array.isArray(attendees) || attendees.length === 0) {
        return null;
    }

    const title = getAttendeesListDisplayString(attendees);

    return (
        <FieldRow
            description={translate('iou.attendees')}
            title={title}
            numberOfLinesTitle={2}
            interactive={false}
            shouldShowRightIcon={false}
        />
    );
}

export default AttendeesRowSnapshot;
