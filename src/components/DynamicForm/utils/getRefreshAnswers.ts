/**
 * Builds the answers a form refresh sends: the current answers, the answer that just changed, and the other answers the same change filled in or cleared.
 * The draft is written after the refresh is asked for, so those have to be applied here to keep an answer from before the change out of the request.
 */
import type {DynamicFormValues} from '@components/DynamicForm/types';

function getRefreshAnswers(currentAnswers: Record<string, unknown>, inputID: string, value: unknown, otherAnswers: DynamicFormValues = {}): Record<string, unknown> {
    const clearedKeys = new Set(Object.keys(otherAnswers).filter((key) => otherAnswers[key] === '' || otherAnswers[key] === undefined));
    const answers = {...currentAnswers, ...otherAnswers, [inputID]: value};
    return Object.fromEntries(Object.entries(answers).filter(([key]) => !clearedKeys.has(key)));
}

export default getRefreshAnswers;
