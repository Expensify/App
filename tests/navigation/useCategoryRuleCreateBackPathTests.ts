import {renderHook} from '@testing-library/react-native';

import useCategoryRuleCreateBackPath from '@hooks/useCategoryRuleCreateBackPath';

import {DYNAMIC_ROUTES} from '@src/ROUTES';

jest.mock('@hooks/useRootNavigationState', () => jest.fn());
jest.mock('@libs/Navigation/helpers/getPathFromState', () => jest.fn());
jest.mock('@libs/Navigation/linkingConfig/config', () => ({
    dynamicTabPatternToTabPaths: new Map(),
}));

const useRootNavigationStateMock = jest.requireMock<jest.Mock>('@hooks/useRootNavigationState');
const getPathFromStateMock: jest.Mock = jest.requireMock('@libs/Navigation/helpers/getPathFromState');

const REQUIRE_FIELDS_SUFFIX = DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_REQUIRE_FIELDS_NEW.path;
const FLAG_FOR_REVIEW_SUFFIX = DYNAMIC_ROUTES.WORKSPACE_CATEGORY_RULES_FLAG_FOR_REVIEW_NEW.path;

describe('useCategoryRuleCreateBackPath', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useRootNavigationStateMock.mockImplementation((selector: (state: unknown) => unknown) => selector({}));
    });

    it('returns the workspace Category Settings path when the rule was created from Workspace > Categories', () => {
        getPathFromStateMock.mockReturnValue(`workspaces/1/categories/category/Meals/rules/new/${REQUIRE_FIELDS_SUFFIX}`);

        const {result} = renderHook(() => useCategoryRuleCreateBackPath(REQUIRE_FIELDS_SUFFIX));

        expect(result.current).toBe('workspaces/1/categories/category/Meals');
    });

    it('returns the quick settings Category Settings path with the inherited backTo when the rule was created from Settings > Categories', () => {
        getPathFromStateMock.mockReturnValue(`settings/1/categories/category-settings/Meals/rules/new/${FLAG_FOR_REVIEW_SUFFIX}?backTo=r%2F123`);

        const {result} = renderHook(() => useCategoryRuleCreateBackPath(FLAG_FOR_REVIEW_SUFFIX));

        expect(result.current).toBe('settings/1/categories/category-settings/Meals?backTo=r%2F123');
    });

    it('returns undefined for the workspace Rules tab create flow, which has no Category Settings ancestor', () => {
        getPathFromStateMock.mockReturnValue('workspaces/1/rules/require-fields-rules/new');

        const {result} = renderHook(() => useCategoryRuleCreateBackPath(REQUIRE_FIELDS_SUFFIX));

        expect(result.current).toBeUndefined();
    });

    it('returns undefined when navigation state has no path', () => {
        getPathFromStateMock.mockReturnValue(undefined);

        const {result} = renderHook(() => useCategoryRuleCreateBackPath(REQUIRE_FIELDS_SUFFIX));

        expect(result.current).toBeUndefined();
    });
});
