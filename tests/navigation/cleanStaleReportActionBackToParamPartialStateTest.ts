import cleanStaleReportActionBackToParam from '@src/pages/inbox/cleanStaleReportActionBackToParam';

import type {NavigationState} from '@react-navigation/native';

const mockDispatch = jest.fn();
let mockRootState: NavigationState | undefined;

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        get current() {
            return {getRootState: () => mockRootState, dispatch: mockDispatch};
        },
    },
}));

describe('cleanStaleReportActionBackToParam with partial nested state', () => {
    beforeEach(() => mockDispatch.mockClear());

    it('skips a keyless route and still updates its keyed sibling through the nested navigator', () => {
        // Given a React Navigation partial state with one keyless screen and one keyed sibling.
        mockRootState = {
            stale: false,
            type: 'stack',
            key: 'root',
            index: 0,
            routeNames: ['Parent'],
            routes: [
                {
                    key: 'parent',
                    name: 'Parent',
                    state: {
                        stale: true,
                        key: 'nested',
                        routes: [
                            {name: 'Keyless', params: {backTo: '/r/111/222'}},
                            {key: 'sibling', name: 'Sibling', params: {backTo: '/r/111/222?foo=bar'}},
                        ],
                    },
                },
            ],
        };

        // When the real cleaner visits both nested routes.
        cleanStaleReportActionBackToParam('111', '222');

        // Then only the keyed sibling receives a targeted update with its query intact.
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith({type: 'SET_PARAMS', payload: {params: {backTo: '/r/111?foo=bar'}}, source: 'sibling', target: 'nested'});
    });
});
