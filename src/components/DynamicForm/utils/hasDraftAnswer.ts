import type {DynamicFormValues} from '@components/DynamicForm/types';

/** An answer the user gave, including `false`, which counts as progress when deciding where a visit resumes */
function hasDraftAnswer(answer: DynamicFormValues[string]): boolean {
    return answer !== undefined && answer !== null && answer !== '' && !(Array.isArray(answer) && answer.length === 0);
}

export default hasDraftAnswer;
