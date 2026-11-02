import {getStateFromPath as RNGetStateFromPath} from '@react-navigation/native';
import Log from '@libs/Log';
import getStateForDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/getStateForDynamicRoute';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import type {Route} from '@src/ROUTES';

jest.mock('@react-navigation/native', () => ({
    getStateFromPath: jest.fn(),
}));

jest.mock('@libs/Log', () => ({
    warn: jest.fn(),
}));

jest.mock('@libs/Navigation/linkingConfig', () => ({
    linkingConfig: {
        config: {},
    },
}));

jest.mock('@libs/Navigation/linkingConfig/config', () => ({
    screensWithOnyxTabNavigator: new Set(),
    dynamicTabPatternToTabPaths: new Map(),
}));

jest.mock('@src/ROUTES', () => ({
    DYNAMIC_ROUTES: {
        SUFFIX_A: {
            path: 'suffix-a',
            entryScreens: ['BaseScreen'],
        },
        SUFFIX_B: {
            path: 'suffix-b',
            entryScreens: ['DynamicSuffixAScreen'],
        },
        SUFFIX_B_UNAUTHORIZED: {
            path: 'suffix-b-unauth',
            entryScreens: ['SomeOtherScreen'],
        },
        MULTI_SEG: {
            path: 'deep/suffix-a',
            entryScreens: ['BaseScreen'],
        },
        MULTI_SEG_LAYER: {
            path: 'suffix-b-from-multi',
            entryScreens: ['DynamicMultiSegScreen'],
        },
        WILDCARD_SUFFIX: {
            path: 'wildcard-suffix',
            entryScreens: ['*'],
        },
        AMBIGUOUS_STATIC: {
            path: 'gl-code',
            entryScreens: ['CategorySettingsScreen'],
        },
        TAG_SETTINGS_PARAM: {
            path: 'tag-settings/:orderWeight/:tagName',
            entryScreens: ['TagsRootScreen'],
        },
    },
}));

jest.mock('@libs/Navigation/helpers/getMatchingNewRoute', () => jest.fn());
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/getStateForDynamicRoute', () => jest.fn());

describe('getStateFromPath', () => {
    const mockRNGetStateFromPath = RNGetStateFromPath as jest.Mock;
    const mockGetStateForDynamicRoute = getStateForDynamicRoute as jest.Mock;
    const mockLogWarn = jest.spyOn(Log, 'warn');

    const focusedRouteParams = {baseParam: '123'};
    const baseRouteState = {routes: [{name: 'BaseScreen', params: focusedRouteParams}]};
    const dynamicSuffixAState = {routes: [{name: 'DynamicSuffixAScreen', params: focusedRouteParams}]};
    const dynamicSuffixBState = {routes: [{name: 'DynamicSuffixBScreen'}]};
    const dynamicMultiSegState = {routes: [{name: 'DynamicMultiSegScreen', params: focusedRouteParams}]};
    const dynamicMultiSegLayerState = {routes: [{name: 'DynamicMultiSegLayerScreen'}]};
    const dynamicWildcardState = {routes: [{name: 'DynamicWildcardScreen'}]};

    beforeEach(() => {
        jest.clearAllMocks();
        mockRNGetStateFromPath.mockReturnValue(baseRouteState);
        mockGetStateForDynamicRoute.mockImplementation((_path: string, dynamicRouteKey: string) => {
            if (dynamicRouteKey === 'SUFFIX_A') {
                return dynamicSuffixAState;
            }
            if (dynamicRouteKey === 'SUFFIX_B') {
                return dynamicSuffixBState;
            }
            if (dynamicRouteKey === 'MULTI_SEG') {
                return dynamicMultiSegState;
            }
            if (dynamicRouteKey === 'MULTI_SEG_LAYER') {
                return dynamicMultiSegLayerState;
            }
            if (dynamicRouteKey === 'WILDCARD_SUFFIX') {
                return dynamicWildcardState;
            }
            return {routes: [{name: 'UnknownDynamic'}]};
        });
    });

    it('should delegate to RN getStateFromPath for standard routes (non-dynamic)', () => {
        const path = '/base/profile';
        const expectedState = {routes: [{name: 'BaseProfile'}]};
        mockRNGetStateFromPath.mockReturnValue(expectedState);

        const result = getStateFromPath(path as unknown as Route);

        expect(result).toBe(expectedState);
    });

    it('should generate dynamic state when authorized screen is focused', () => {
        const fullPath = '/base/suffix-a';

        const result = getStateFromPath(fullPath as unknown as Route);

        expect(result).toBe(dynamicSuffixAState);
        expect(mockGetStateForDynamicRoute).toHaveBeenCalledWith(fullPath, 'SUFFIX_A', focusedRouteParams, undefined);
    });

    it('should fallback to standard RN parsing if focused screen is NOT authorized for dynamic route', () => {
        const fullPath = '/unknown/suffix-b-unauth';
        const standardState = {routes: [{name: 'FallbackRoute'}]};
        mockRNGetStateFromPath.mockReturnValue(standardState);

        const result = getStateFromPath(fullPath as unknown as Route);

        expect(result).toBe(standardState);
        expect(mockLogWarn).toHaveBeenCalledWith(expect.stringContaining('None of the'));
    });

    describe('layered dynamic suffixes', () => {
        it('should authorize a layered suffix when the inner dynamic screen is listed in entryScreens', () => {
            const fullPath = '/base/suffix-a/suffix-b';

            const result = getStateFromPath(fullPath as unknown as Route);

            expect(result).toBe(dynamicSuffixBState);
            expect(mockGetStateForDynamicRoute).toHaveBeenCalledWith('/base/suffix-a', 'SUFFIX_A', focusedRouteParams, undefined);
            expect(mockGetStateForDynamicRoute).toHaveBeenCalledWith(fullPath, 'SUFFIX_B', focusedRouteParams, undefined);
        });

        it('should fallback to RN parsing when the outer suffix entryScreens does not include the inner dynamic screen', () => {
            const fullPath = '/base/suffix-a/suffix-b-unauth';
            const standardState = {routes: [{name: 'FallbackRoute'}]};
            mockRNGetStateFromPath.mockImplementation((path: string) => {
                if (path === fullPath) {
                    return standardState;
                }
                return baseRouteState;
            });

            const result = getStateFromPath(fullPath as unknown as Route);

            expect(result).toBe(standardState);
            expect(mockGetStateForDynamicRoute).toHaveBeenCalledWith('/base/suffix-a', 'SUFFIX_A', focusedRouteParams, undefined);
            expect(mockLogWarn).toHaveBeenCalledWith(expect.stringContaining('None of the'));
        });

        it('should pass the full layered path including query params to the outer dynamic route builder', () => {
            const fullPath = '/base/suffix-a/suffix-b?param=val';

            getStateFromPath(fullPath as unknown as Route);

            expect(mockGetStateForDynamicRoute).toHaveBeenCalledWith(fullPath, 'SUFFIX_B', focusedRouteParams, undefined);
        });

        it('should support a multi-segment inner suffix inside the layered path', () => {
            const fullPath = '/base/deep/suffix-a/suffix-b-from-multi';

            const result = getStateFromPath(fullPath as unknown as Route);

            expect(result).toBe(dynamicMultiSegLayerState);
            expect(mockGetStateForDynamicRoute).toHaveBeenCalledWith('/base/deep/suffix-a', 'MULTI_SEG', focusedRouteParams, undefined);
            expect(mockGetStateForDynamicRoute).toHaveBeenCalledWith(fullPath, 'MULTI_SEG_LAYER', focusedRouteParams, undefined);
        });
    });

    describe('wildcard entryScreens', () => {
        it('should authorize any focused screen when entryScreens contains wildcard', () => {
            const fullPath = '/base/wildcard-suffix';

            const result = getStateFromPath(fullPath as unknown as Route);

            expect(result).toBe(dynamicWildcardState);
            expect(mockGetStateForDynamicRoute).toHaveBeenCalledWith(fullPath, 'WILDCARD_SUFFIX', focusedRouteParams, undefined);
            expect(mockLogWarn).not.toHaveBeenCalled();
        });

        it('should authorize wildcard in a layered scenario where the inner screen is not explicitly listed', () => {
            const fullPath = '/base/suffix-a/wildcard-suffix';

            const result = getStateFromPath(fullPath as unknown as Route);

            expect(result).toBe(dynamicWildcardState);
            expect(mockGetStateForDynamicRoute).toHaveBeenCalledWith('/base/suffix-a', 'SUFFIX_A', focusedRouteParams, undefined);
            expect(mockGetStateForDynamicRoute).toHaveBeenCalledWith(fullPath, 'WILDCARD_SUFFIX', focusedRouteParams, undefined);
            expect(mockLogWarn).not.toHaveBeenCalled();
        });
    });

    describe('ambiguous suffix disambiguation', () => {
        const tagsRootParams = {policyID: '456'};
        const tagsRootState = {routes: [{name: 'TagsRootScreen', params: tagsRootParams}]};
        const categorySettingsParams = {categoryName: 'food'};
        const categorySettingsState = {routes: [{name: 'CategorySettingsScreen', params: categorySettingsParams}]};
        const tagSettingsParamState = {routes: [{name: 'TagSettingsParamScreen'}]};
        const ambiguousStaticState = {routes: [{name: 'AmbiguousStaticScreen'}]};

        beforeEach(() => {
            const baseImpl = mockGetStateForDynamicRoute.getMockImplementation();
            mockGetStateForDynamicRoute.mockImplementation((path: string, dynamicRouteKey: string) => {
                if (dynamicRouteKey === 'AMBIGUOUS_STATIC') {
                    return ambiguousStaticState;
                }
                if (dynamicRouteKey === 'TAG_SETTINGS_PARAM') {
                    return tagSettingsParamState;
                }
                return baseImpl?.(path, dynamicRouteKey) as unknown;
            });
        });

        it('should warn and fallback to RN when ALL dynamic candidates fail entryScreens validation', () => {
            const fullPath = '/tags-root/tag-settings/0/gl-code';
            const unknownState = {routes: [{name: 'UnknownScreen'}]};
            const fallbackState = {routes: [{name: 'FallbackRoute'}]};
            mockRNGetStateFromPath.mockImplementation((path: string) => {
                if (path === fullPath) {
                    return fallbackState;
                }
                return unknownState;
            });

            const result = getStateFromPath(fullPath as unknown as Route);

            expect(result).toBe(fallbackState);
            expect(mockLogWarn).toHaveBeenCalledWith(expect.stringContaining('None of the'));
            expect(mockGetStateForDynamicRoute).not.toHaveBeenCalled();
        });

        it('should resolve to the parametric candidate when the greedy static match fails but a longer parametric suffix validates (post-fix)', () => {
            const fullPath = '/tags-root/tag-settings/0/gl-code';
            mockRNGetStateFromPath.mockReturnValue(tagsRootState);

            const result = getStateFromPath(fullPath as unknown as Route);

            expect(result).toBe(tagSettingsParamState);
            expect(mockGetStateForDynamicRoute).toHaveBeenCalledWith(fullPath, 'TAG_SETTINGS_PARAM', expect.objectContaining({orderWeight: '0', tagName: 'gl-code'}), undefined);
            expect(mockLogWarn).not.toHaveBeenCalled();
        });

        it('should use the first matching candidate immediately when entryScreens validation passes', () => {
            const fullPath = '/category-settings/gl-code';
            mockRNGetStateFromPath.mockReturnValue(categorySettingsState);

            const result = getStateFromPath(fullPath as unknown as Route);

            expect(result).toBe(ambiguousStaticState);
            expect(mockGetStateForDynamicRoute).toHaveBeenCalledWith(fullPath, 'AMBIGUOUS_STATIC', expect.objectContaining(categorySettingsParams), undefined);
            expect(mockLogWarn).not.toHaveBeenCalled();
        });
    });
});
