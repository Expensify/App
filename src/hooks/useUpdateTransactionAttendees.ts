/**
 * Writes the attendees of an expense, from wherever they are picked. A draft takes them straight away, and a saved
 * expense saves them through the API. Both the attendees page and the anchored dropdown save through here, so a pick
 * in either leaves the expense in the same state.
 */
import {setMoneyRequestAttendees} from '@libs/actions/IOU/MoneyRequest';
import {updateMoneyRequestAttendees} from '@libs/actions/IOU/UpdateMoneyRequest';

import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';

import type {OnyxEntry} from 'react-native-onyx';

import useMoneyRequestUpdateParams from './useMoneyRequestUpdateParams';
import useNetwork from './useNetwork';

type UseUpdateTransactionAttendeesParams = {
    /** ID of the expense being written to, and of the draft a not-yet-created expense lives in */
    transactionID: string;

    /** Report the expense lives on: the transaction thread when a saved expense is edited */
    report: OnyxEntry<OnyxTypes.Report>;

    /** Whether a saved expense is being edited rather than a draft being filled in */
    isEditing: boolean;
};

type UseUpdateTransactionAttendeesResult = {
    /** Writes `attendees` to the expense */
    updateAttendees: (attendees: Attendee[]) => void;
};

function useUpdateTransactionAttendees({transactionID, report, isEditing}: UseUpdateTransactionAttendeesParams): UseUpdateTransactionAttendeesResult {
    const updateParams = useMoneyRequestUpdateParams(transactionID, report);
    const {isOffline} = useNetwork();

    const updateAttendees = (attendees: Attendee[]) => {
        if (isEditing) {
            updateMoneyRequestAttendees({...updateParams, transactionID, attendees, isOffline});
            return;
        }
        setMoneyRequestAttendees(transactionID, attendees, true);
    };

    return {updateAttendees};
}

export default useUpdateTransactionAttendees;
