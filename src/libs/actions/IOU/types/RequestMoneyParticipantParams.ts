import type {Participant} from '@src/types/onyx/IOU';

type RequestMoneyParticipantParams = {
    payeeEmail: string | undefined;
    payeeAccountID: number;
    participant: Participant;
};

export default RequestMoneyParticipantParams;
