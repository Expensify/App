import type {ReimbursementAccount} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

const reimbursementAccountErrorSelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => reimbursementAccount?.errors;

// eslint-disable-next-line import/prefer-default-export
export {reimbursementAccountErrorSelector};
