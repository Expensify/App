import ONYXKEYS from '../../ONYXKEYS';
import Account from './Account';

type OnyxValues = {
    [ONYXKEYS.ACCOUNT]: Account;
    [ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID]?: string;
    [ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER]?: boolean;
    [ONYXKEYS.ACTIVE_CLIENTS]: string[];
    [ONYXKEYS.DEVICE_ID]: string;
};

export default OnyxValues;
