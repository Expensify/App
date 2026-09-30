import type {AnyRequest} from './Request';

/** Queued write requests held across a sign-out caused by a failed reauthentication, so they can be re-queued when the same account signs back in */
type ParkedPersistedRequests = {
    /** Account that owned the queue when it was parked */
    accountID: number;

    /** Time the queue was parked, in milliseconds since epoch */
    parkedAt: number;

    /** Requests to re-queue, in their original order */
    requests: AnyRequest[];
};

export default ParkedPersistedRequests;
