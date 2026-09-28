import type {DynamicFormValues} from './types';

function isAnswerRecord(value: unknown): value is DynamicFormValues {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export default isAnswerRecord;
