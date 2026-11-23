import getNavigationActionForReplay from '@libs/Navigation/helpers/getNavigationActionForReplay';

let mockIsNavigationReady = true;
jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        isReady: () => mockIsNavigationReady,
        getRootState: () => ({key: 'root', routes: [{key: 'tab-navigator'}, {key: 'rhp-route'}]}),
    },
}));

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
