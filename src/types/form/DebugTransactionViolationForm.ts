import type {ValueOf} from 'type-fest';
import type {ViolationName, ViolationType} from '@src/types/onyx/TransactionViolation';
import type Form from './Form';

const INPUT_IDS = {
    NAME: 'name',
    TYPE: 'type',
    DATA: 'data',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type DebugTransactionViolationForm = Form<
    InputID,
    {
        [INPUT_IDS.NAME]: ViolationName;
        [INPUT_IDS.TYPE]: ViolationType;
        [INPUT_IDS.DATA]: string;
    }
>;

export type {DebugTransactionViolationForm};
export default INPUT_IDS;
