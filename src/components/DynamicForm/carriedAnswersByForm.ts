import type {DynamicFormValues} from './types';

/** Each sub page is a separate route mount, so answers kept out of the draft live here for the length of one visit to the flow */
const carriedAnswersByForm = new Map<string, DynamicFormValues>();

export default carriedAnswersByForm;
