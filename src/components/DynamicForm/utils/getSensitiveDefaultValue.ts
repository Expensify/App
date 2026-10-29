import type {DynamicFieldAnswerMap} from '@components/DynamicForm/renderers/types';
import type {DynamicFormFieldOfType, DynamicFormValues} from '@components/DynamicForm/types';
import type {FormValue} from '@components/Form/types';

import type {DynamicFormFieldType, DynamicFormListItem} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

import isSensitiveField from './isSensitiveField';
import {isListItem} from './listItems';

type AnswerGuards = {[TType in DynamicFormFieldType]: (answer: FormValue) => answer is DynamicFieldAnswerMap[TType]};

function isString(answer: FormValue): answer is string {
    return typeof answer === 'string';
}

function isStringList(answer: FormValue): answer is string[] {
    return Array.isArray(answer) && answer.every((item) => typeof item === 'string');
}

function isBoolean(answer: FormValue): answer is boolean {
    return typeof answer === 'boolean';
}

function isFileList(answer: FormValue): answer is FileObject[] {
    return Array.isArray(answer) && answer.every((item) => typeof item === 'object');
}

function isListItems(answer: FormValue): answer is DynamicFormListItem[] {
    return Array.isArray(answer) && answer.every(isListItem);
}

const ANSWER_GUARDS: AnswerGuards = {
    text: isString,
    number: isString,
    select: isString,
    radio: isString,
    multiselect: isStringList,
    date: isString,
    address: isString,
    file: isFileList,
    amount: isString,
    country: isString,
    countryMultiselect: isStringList,
    boolean: isBoolean,
    currency: isString,
    percent: isString,
    list: isListItems,
};

/** Sensitive answers are not drafted, so a page the user comes back to is refilled from the answers kept in memory. `isInSensitiveForm` treats every field as sensitive. */
function getSensitiveDefaultValue<TType extends DynamicFormFieldType>(
    field: DynamicFormFieldOfType<TType>,
    values: DynamicFormValues,
    isInSensitiveForm = false,
): DynamicFieldAnswerMap[TType] | undefined {
    const answer = values[field.key];
    const isAnswer: AnswerGuards[TType] = ANSWER_GUARDS[field.type];
    return (isInSensitiveForm || isSensitiveField(field)) && answer !== undefined && isAnswer(answer) ? answer : undefined;
}

export default getSensitiveDefaultValue;
