import isNavigationInsideFlow from '@libs/Navigation/helpers/isNavigationInsideFlow';

describe('isNavigationInsideFlow', () => {
    const flowRoot = {name: 'Money_Request_Create', params: {transactionID: '1'}};

    it('keeps a browser back in the flow when the restored state still holds the flow root', () => {
        // Given a RESET after a refresh that restores the same flow root, nested under the RHP
        const action = {
            type: 'RESET',
            payload: {routes: [{name: 'RightModalNavigator', state: {routes: [{name: 'MoneyRequest', params: {params: {transactionID: '1'}}, state: {routes: [flowRoot]}}]}}]},
        };

        // When checking whether it leaves the flow
        // Then it stays in the flow
        expect(isNavigationInsideFlow(action, flowRoot)).toBe(true);
    });

    it('treats a browser back that drops the flow root, or holds another draft, as leaving the flow', () => {
        // Given RESETs restoring a state without the flow root, and one with the root of another draft
        const closingReset = {type: 'RESET', payload: {routes: [{name: 'Home'}]}};
        const resetToOtherDraft = {type: 'RESET', payload: {routes: [{name: flowRoot.name, params: {transactionID: '2'}}]}};

        // When checking whether they leave the flow
        // Then both leave it
        expect(isNavigationInsideFlow(closingReset, flowRoot)).toBe(false);
        expect(isNavigationInsideFlow(resetToOtherDraft, flowRoot)).toBe(false);
    });

    it('treats closing the RHP as leaving the flow', () => {
        // Given the actions that close the RHP or go back from the flow root
        // When checking whether they leave the flow
        // Then they do
        expect(isNavigationInsideFlow({type: 'DISMISS_MODAL'}, flowRoot)).toBe(false);
        expect(isNavigationInsideFlow({type: 'GO_BACK', source: 'rhp-route'}, flowRoot)).toBe(false);
        expect(isNavigationInsideFlow({type: 'POP', target: 'rhp-navigator'}, flowRoot)).toBe(false);
        expect(isNavigationInsideFlow({type: 'GO_BACK'}, flowRoot)).toBe(false);
    });
});
