import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/** Merge account steps */
type MergeAccountStep = ValueOf<typeof CONST.MERGE_ACCOUNT_STEPS> | '';

/** Merge account result */
type MergeAccountResult = ValueOf<typeof CONST.MERGE_ACCOUNT_RESULTS> | '';

export type {MergeAccountStep, MergeAccountResult};
