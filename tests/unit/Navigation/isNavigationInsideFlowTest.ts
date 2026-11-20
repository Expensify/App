import isNavigationInsideFlow from '@libs/Navigation/helpers/isNavigationInsideFlow';

describe('isNavigationInsideFlow', () => {
    const flowRoot = {name: 'Money_Request_Create', params: {transactionID: '1'}};
    const flowStack = {key: 'flow-stack', routeNames: [flowRoot.name, 'Money_Request_Step_Scan']};

    it('keeps a browser back in the flow when the restored state still holds the flow root', () => {
        // Given a RESET after a refresh that restores the same flow root, nested under the RHP
        const action = {
            type: 'RESET',
            payload: {routes: [{name: 'RightModalNavigator', state: {routes: [{name: 'MoneyRequest', params: {params: {transactionID: '1'}}, state: {routes: [flowRoot]}}]}}]},
        };

        // When checking whether it leaves the flow
        // Then it stays in the flow
        expect(isNavigationInsideFlow(action, flowRoot, flowStack)).toBe(true);
    });

    it('treats a browser back that drops the flow root, or holds another draft, as leaving the flow', () => {
        // Given RESETs restoring a state without the flow root, and one with the root of another draft
        const closingReset = {type: 'RESET', payload: {routes: [{name: 'Home'}]}};
        const resetToOtherDraft = {type: 'RESET', payload: {routes: [{name: flowRoot.name, params: {transactionID: '2'}}]}};

        // When checking whether they leave the flow
        // Then both leave it
        expect(isNavigationInsideFlow(closingReset, flowRoot, flowStack)).toBe(false);
        expect(isNavigationInsideFlow(resetToOtherDraft, flowRoot, flowStack)).toBe(false);
    });

    it('keeps a replace inside the flow stack in the flow', () => {
        // Given replaces aimed at the flow's own stack and at another navigator, like the header back of a dropped receipt's
        // confirmation that opens the Scan step in its place
        // When checking whether they leave the flow
        // Then only the one inside the flow stack stays in the flow
        expect(isNavigationInsideFlow({type: 'REPLACE', target: 'flow-stack'}, flowRoot, flowStack)).toBe(true);
        expect(isNavigationInsideFlow({type: 'REPLACE', target: 'root'}, flowRoot, flowStack)).toBe(false);
    });

    it('keeps a replace without a target in the flow only when the flow stack has the new screen', () => {
        // Given replaces without a target, which the first navigator up from the focused screen that has the new screen handles:
        // one opening a step of the flow, and one opening a screen outside the RHP that only the root has
        const replaceWithFlowStep = {type: 'REPLACE', payload: {name: 'Money_Request_Step_Scan'}};
        const replaceWithOutsideScreen = {type: 'REPLACE', payload: {name: 'TabNavigator'}};

        // When checking whether they leave the flow
        // Then only the one the flow stack handles stays in the flow
        expect(isNavigationInsideFlow(replaceWithFlowStep, flowRoot, flowStack)).toBe(true);
        expect(isNavigationInsideFlow(replaceWithOutsideScreen, flowRoot, flowStack)).toBe(false);
    });

    it('treats closing the RHP as leaving the flow', () => {
        // Given the actions that close the RHP or go back from the flow root
        // When checking whether they leave the flow
        // Then they do
        expect(isNavigationInsideFlow({type: 'DISMISS_MODAL'}, flowRoot, flowStack)).toBe(false);
        expect(isNavigationInsideFlow({type: 'GO_BACK', source: 'rhp-route'}, flowRoot, flowStack)).toBe(false);
        expect(isNavigationInsideFlow({type: 'POP', target: 'rhp-navigator'}, flowRoot, flowStack)).toBe(false);
        expect(isNavigationInsideFlow({type: 'GO_BACK'}, flowRoot, flowStack)).toBe(false);
    });
});
