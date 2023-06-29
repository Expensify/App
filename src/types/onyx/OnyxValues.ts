import ONYXKEYS from '../../ONYXKEYS';
import Account from './Account';

type OnyxValues = {
    [ONYXKEYS.ACCOUNT]: Account;
    [ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID]: string;
};

export default OnyxValues;
