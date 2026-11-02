import CONST from '@src/CONST';
import type {Participant} from '@src/types/onyx/IOU';
import type Transaction from '@src/types/onyx/Transaction';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import type {OnyxEntry} from 'react-native-onyx';

type GetSelectedParticipantsForSubmissionParams = {
    transaction: OnyxEntry<Transaction>;
    iouType: DeepValueOf<typeof CONST.IOU.TYPE>;
    selectedParticipants: Participant[];
};

function getSelectedParticipantsForSubmission({transaction, iouType, selectedParticipants}: GetSelectedParticipantsForSubmissionParams): Participant[] {
    if (iouType !== CONST.IOU.TYPE.SPLIT || !transaction?.splitShares) {
        return selectedParticipants;
    }

    const participantsWithAmount = new Set(
        Object.keys(transaction.splitShares)
            .filter((accountID: string): boolean => (transaction?.splitShares?.[Number(accountID)]?.amount ?? 0) > 0)
            .map((accountID) => Number(accountID)),
    );

    // Filter out participants with an amount equal to O
    return selectedParticipants.filter((participant) =>
        participantsWithAmount.has(participant.isPolicyExpenseChat ? (participant?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID) : (participant.accountID ?? CONST.DEFAULT_NUMBER_ID)),
    );
}

export default getSelectedParticipantsForSubmission;
