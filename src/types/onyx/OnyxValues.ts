import ONYXKEYS from '../../ONYXKEYS';
import Account from './Account';
import QueuedOnyxUpdates from './QueuedOnyxUpdates';

type OnyxValues = {
    [ONYXKEYS.ACCOUNT]: Account;
    [ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID]?: string;
    [ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER]?: boolean;
    [ONYXKEYS.ACTIVE_CLIENTS]: string[];
    [ONYXKEYS.DEVICE_ID]: string;
    [ONYXKEYS.IS_SIDEBAR_LOADED]?: boolean;
    // TODO: Type persisted requests properly
    [ONYXKEYS.PERSISTED_REQUESTS]: unknown[];
    [ONYXKEYS.QUEUED_ONYX_UPDATES]: QueuedOnyxUpdates;
};

export default OnyxValues;
