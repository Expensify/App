import type {Participant} from '@src/types/onyx/IOU';

export type RequestMoneyParticipantParams = {
    payeeEmail: string | undefined;
    payeeAccountID: number;
    participant: Participant;
};
