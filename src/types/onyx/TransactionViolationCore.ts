import type {DELEGATE_ROLE} from '@src/CONST/language/Misc';
import type {MODIFIED_AMOUNT_VIOLATION_DATA} from '@src/CONST/language/TransactionViolation';

import type {ValueOf} from 'type-fest';

/** The role of the delegate */
type DelegateRole = ValueOf<typeof DELEGATE_ROLE>;

/** Types for the data in the modifiedAmount violation */
type ViolationDataType = ValueOf<typeof MODIFIED_AMOUNT_VIOLATION_DATA>;

export type {DelegateRole, ViolationDataType};
