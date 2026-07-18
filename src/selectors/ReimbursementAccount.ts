import type {ReimbursementAccount} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

const reimbursementAccountErrorSelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => reimbursementAccount?.errors;

const hasReimbursementAccountErrorsSelector = (reimbursementAccount: OnyxEntry<ReimbursementAccount>) => !isEmptyObject(reimbursementAccount?.errors);

export {reimbursementAccountErrorSelector, hasReimbursementAccountErrorsSelector};
