import {findFocusedRoute, getPathFromState as RNGetPathFromState} from '@react-navigation/native';
import type {NavigationState, PartialState} from '@react-navigation/routers';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';

jest.mock('@react-navigation/native', () => ({
    findFocusedRoute: jest.fn(),
    getPathFromState: jest.fn(),
}));

jest.mock('@libs/Navigation/linkingConfig/config', () => ({
    normalizedConfigs: {
        TestDynamicScreen: {
            path: 'test-dynamic',
        },
        StandardScreen: {
            path: 'standard',
        },
    },
}));

jest.mock('@libs/Navigation/linkingConfig', () => ({
    linkingConfig: {
        config: {},
    },
}));

jest.mock('@src/ROUTES', () => ({
    DYNAMIC_ROUTES: {
        TEST_DYNAMIC: {
            path: 'test-dynamic',
        },
    },
}));

describe('getPathFromState', () => {
    const mockFindFocusedRoute = findFocusedRoute as jest.Mock;
    const mockRNGetPathFromState = RNGetPathFromState as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return path from focused route for dynamic screens when path is present', () => {
        const state = {} as PartialState<NavigationState>;
        const expectedPath = '/test-dynamic/123';

        mockFindFocusedRoute.mockReturnValue({
            name: 'TestDynamicScreen',
            path: expectedPath,
        });

        const result = getPathFromState(state);

        expect(result).toBe(expectedPath);
        expect(mockRNGetPathFromState).not.toHaveBeenCalled();
    });

    it('should fall back to RN getPathFromState for dynamic screens when path is MISSING', () => {
        const state = {} as PartialState<NavigationState>;
        const expectedPath = '/generated/path';

        mockFindFocusedRoute.mockReturnValue({
            name: 'TestDynamicScreen',
        });
        mockRNGetPathFromState.mockReturnValue(expectedPath);

        const result = getPathFromState(state);

        expect(result).toBe(expectedPath);
        expect(mockRNGetPathFromState).toHaveBeenCalledWith(state, expect.anything());
    });

    it('should use RN getPathFromState for standard screens', () => {
        const state = {} as PartialState<NavigationState>;
        const expectedPath = '/standard/path';

        mockFindFocusedRoute.mockReturnValue({
            name: 'StandardScreen',
        });
        mockRNGetPathFromState.mockReturnValue(expectedPath);

        const result = getPathFromState(state);

        expect(result).toBe(expectedPath);
        expect(mockRNGetPathFromState).toHaveBeenCalledWith(state, expect.anything());
    });

    it('should handle state where no route is focused', () => {
        const state = {} as PartialState<NavigationState>;
        mockFindFocusedRoute.mockReturnValue(undefined);
        mockRNGetPathFromState.mockReturnValue('/fallback');

        const result = getPathFromState(state);

        expect(result).toBe('/fallback');
        expect(mockRNGetPathFromState).toHaveBeenCalled();
    });
});
