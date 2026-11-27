import findFocusedRouteWithOnyxTabGuard from '@libs/Navigation/helpers/findFocusedRouteWithOnyxTabGuard';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';

import SCREENS from '@src/SCREENS';

/**
 * The expense default editor opens from the "Create a rule" callout as dynamic suffixes on the expense's own
 * path, so each step resolves only when its `entryScreens` names the screen it is pushed from. A match type page
 * sits on top of the page it refines rather than on the rule page, which the workspace settings flow never
 * exercises, so only a path test catches a step that resolves to Not found.
 */
const RULE_PATH = 'r/1234/merchant-rule/new';

const getFocusedScreen = (...dynamicSuffixes: string[]) => {
    const path = `${RULE_PATH}${dynamicSuffixes.map((suffix) => `/${suffix}`).join('')}?policyID=ABC123`;
    return findFocusedRouteWithOnyxTabGuard(getStateFromPath(path) ?? {})?.name;
};

describe('expense default rule dynamic routes', () => {
    it('opens a condition step pushed from the rule page', () => {
        // Given the callout's rule page with a condition step appended to it
        // When the path is resolved
        // Then the step opens, because the rule page is one of its entry screens
        expect(getFocusedScreen('rule-amount-to-match')).toBe(SCREENS.WORKSPACE.DYNAMIC_RULES_AMOUNT_TO_MATCH);
    });

    it.each([
        ['rule-date-to-match', 'rule-date-match-type', SCREENS.WORKSPACE.DYNAMIC_RULES_DATE_MATCH_TYPE],
        ['rule-amount-to-match', 'rule-amount-match-type', SCREENS.WORKSPACE.DYNAMIC_RULES_AMOUNT_MATCH_TYPE],
        ['rule-merchant-to-match', 'rule-match-type', SCREENS.WORKSPACE.DYNAMIC_RULES_MERCHANT_MATCH_TYPE],
    ])('opens the match type step pushed on top of %s', (conditionSuffix, matchTypeSuffix, expectedScreen) => {
        // Given a match type step appended to the condition step that opens it
        // When the path is resolved
        // Then the match type step opens rather than falling through to Not found
        expect(getFocusedScreen(conditionSuffix, matchTypeSuffix)).toBe(expectedScreen);
    });
});
