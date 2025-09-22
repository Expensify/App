import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {ReimbursementAccount} from '@src/types/onyx';

const hasVBASelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => reimbursementAccount?.achData?.state === CONST.BANK_ACCOUNT.STATE.OPEN;

export default hasVBASelector;
