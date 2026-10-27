import {
    isFlowDiscardPromptSuppressed,
    isReplayingDiscardedNavigation,
    releaseFlowDiscardPromptSuppression,
    runWhileReplayingDiscardedNavigation,
    suppressFlowDiscardPrompt,
} from '@libs/Navigation/helpers/discardPromptState';
import getNavigationActionForReplay from '@libs/Navigation/helpers/getNavigationActionForReplay';
import isInFlowNavigationForRoot from '@libs/Navigation/helpers/isInFlowNavigationForRoot';

import CONST from '@src/CONST';

let mockIsNavigationReady = true;
jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        isReady: () => mockIsNavigationReady,
        getRootState: () => ({key: 'root', routes: [{key: 'tab-navigator'}, {key: 'rhp-route'}]}),
    },
}));

describe('discardPromptState', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        releaseFlowDiscardPromptSuppression();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('keeps the flow muted until the suppression is released', () => {
        // Given a submit that muted the flow's discard guards
        suppressFlowDiscardPrompt();

        // When nothing released it yet
        // Then the flow stays muted
        expect(isFlowDiscardPromptSuppressed()).toBe(true);

        // When the submit aborts and releases it
        releaseFlowDiscardPromptSuppression();

        // Then the guards prompt again
        expect(isFlowDiscardPromptSuppressed()).toBe(false);
    });

    it('releases a forgotten suppression after a safety timeout', () => {
        // Given a suppression that nothing releases, such as a submit that stays on the page without unlocking
        suppressFlowDiscardPrompt();

        // When the safety timeout passes
        jest.advanceTimersByTime(CONST.MAX_TRANSITION_DURATION_MS * 5);

        // Then the flow isn't muted for good
        expect(isFlowDiscardPromptSuppressed()).toBe(false);
    });

    it('marks the replay of a discarded navigation, even when the replay throws', () => {
        // Given no replay in progress
        expect(isReplayingDiscardedNavigation()).toBe(false);

        // When a confirmed navigation is replayed
        let isReplayingDuringReplay = false;
        runWhileReplayingDiscardedNavigation(() => {
            isReplayingDuringReplay = isReplayingDiscardedNavigation();
        });

        // Then the other guards can tell while it runs, and only while it runs
        expect(isReplayingDuringReplay).toBe(true);
        expect(isReplayingDiscardedNavigation()).toBe(false);

        // When the replay throws
        expect(() =>
            runWhileReplayingDiscardedNavigation(() => {
                throw new Error('replay failed');
            }),
        ).toThrow('replay failed');

        // Then the marker is still cleared, so later navigations prompt normally
        expect(isReplayingDiscardedNavigation()).toBe(false);
    });
});

describe('getNavigationActionForReplay', () => {
    beforeEach(() => {
        mockIsNavigationReady = true;
    });

    it('targets the root navigator for a back without a target, sent from a root-level route', () => {
        // Given the RHP overlay's GO_BACK without a target, sent from the root-level RHP route
        const action = {type: 'GO_BACK', source: 'rhp-route'};

        // When preparing it for replay through the container
        const actionForReplay = getNavigationActionForReplay(action);

        // Then it targets the root, which closed the whole RHP the first time
        expect(actionForReplay).toEqual({type: 'GO_BACK', source: 'rhp-route', target: 'root'});
    });

    it.each([
        ['a targeted action', {type: 'POP', source: 'rhp-route', target: 'money-request-stack'}],
        ['an action without a source', {type: 'GO_BACK'}],
        ['an action that is not a back', {type: 'NAVIGATE', source: 'rhp-route'}],
        ['an action sent from a nested screen', {type: 'GO_BACK', source: 'confirmation-route'}],
    ])('replays %s unchanged', (_, action) => {
        // Given an action the deepest navigator handles the same way on replay
        // When preparing it for replay
        // Then it's left as is
        expect(getNavigationActionForReplay(action)).toBe(action);
    });

    it('replays the action unchanged before navigation is ready', () => {
        // Given a navigation container that isn't ready
        mockIsNavigationReady = false;
        const action = {type: 'GO_BACK', source: 'rhp-route'};

        // When preparing an overlay back for replay
        // Then it's left as is
        expect(getNavigationActionForReplay(action)).toBe(action);
    });
});

describe('isInFlowNavigationForRoot', () => {
    const flowRoot = {name: 'Money_Request_Create', params: {transactionID: '1'}};

    it('keeps a browser back in the flow when the restored state still holds the flow root', () => {
        // Given a RESET restoring a state that nests the same flow root under the RHP
        const action = {
            type: 'RESET',
            payload: {routes: [{name: 'RightModalNavigator', state: {routes: [{name: 'MoneyRequest', params: {params: {transactionID: '1'}}, state: {routes: [flowRoot]}}]}}]},
        };

        // When checking whether it leaves the flow
        // Then it stays in the flow
        expect(isInFlowNavigationForRoot(action, flowRoot, 'flow-stack')).toBe(true);
    });

    it('treats a browser back that drops the flow root, or holds another draft, as leaving the flow', () => {
        // Given RESETs restoring a state without the flow root, and one with the root of another draft
        const closingReset = {type: 'RESET', payload: {routes: [{name: 'Home'}]}};
        const resetToOtherDraft = {type: 'RESET', payload: {routes: [{name: 'Money_Request_Create', params: {transactionID: '2'}}]}};

        // When checking whether they leave the flow
        // Then both leave it
        expect(isInFlowNavigationForRoot(closingReset, flowRoot, 'flow-stack')).toBe(false);
        expect(isInFlowNavigationForRoot(resetToOtherDraft, flowRoot, 'flow-stack')).toBe(false);
    });

    it('keeps a replace inside the flow stack in the flow', () => {
        // Given replaces aimed at the flow's own stack and at another navigator
        // When checking whether they leave the flow
        // Then only the one inside the flow stack stays in the flow
        expect(isInFlowNavigationForRoot({type: 'REPLACE', target: 'flow-stack'}, flowRoot, 'flow-stack')).toBe(true);
        expect(isInFlowNavigationForRoot({type: 'REPLACE', target: 'root'}, flowRoot, 'flow-stack')).toBe(false);
    });

    it('treats closing actions as leaving the flow', () => {
        // Given the actions that close the RHP
        // When checking whether they leave the flow
        // Then they do
        expect(isInFlowNavigationForRoot({type: 'DISMISS_MODAL'}, flowRoot, 'flow-stack')).toBe(false);
        expect(isInFlowNavigationForRoot({type: 'GO_BACK', source: 'rhp-route'}, flowRoot, 'flow-stack')).toBe(false);
    });
});
