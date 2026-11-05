import {getBusinessActivityAnswers} from '@pages/ReimbursementAccount/NonUSD/utils/getBusinessActivityAnswers';

import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const firstActivity = INPUT_IDS.ADDITIONAL_DATA.CORPAY.IS_CLIENT_CHARITABLE_ORGANIZATION;
const secondActivity = INPUT_IDS.ADDITIONAL_DATA.CORPAY.IS_CLIENT_CRYPTO_COMPANY;

describe('AU business activities', () => {
    test('keeps a negative answer when resuming a saved application', () => {
        // Given Corpay returned a false answer, which must not be mistaken for a missing answer.
        const saved = {[firstActivity]: false};
        // When the screen reads the resumed answers.
        const answers = getBusinessActivityAnswers(undefined, saved);
        // Then the negative answer remains explicit and the other unanswered questions remain missing.
        expect(answers[firstActivity]).toBe(false);
        expect(answers[secondActivity]).toBeUndefined();
    });

    test('prefers an edited draft answer over the server response', () => {
        // Given the user changed an affirmative saved answer to No while editing.
        const saved = {[firstActivity]: true};
        const draft = {[firstActivity]: 'false', [secondActivity]: 'true'};
        // When the business details are prepared for saving.
        const answers = getBusinessActivityAnswers(draft, saved);
        // Then the changed answer is a boolean false in the Corpay request, not a truthy string.
        expect(answers[firstActivity]).toBe(false);
        expect(answers[secondActivity]).toBe(true);
    });

    test('does not treat an unselected answer as No', () => {
        // Given an untouched nine-question activity form.
        const draft = {[firstActivity]: ''};
        // When the form is read before the user responds.
        const answers = getBusinessActivityAnswers(draft, undefined);
        // Then no negative answers are silently invented.
        expect(Object.keys(answers)).toHaveLength(0);
    });
});
