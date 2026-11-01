import {renderHook} from '@testing-library/react-native';

import useHasReportAwaitingApproval from '@hooks/useHasReportAwaitingApproval';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';

import type {SearchTypeMenuSection} from '@libs/SearchUIUtils';
import {createTypeMenuSections} from '@libs/SearchUIUtils';

jest.mock('@libs/SearchUIUtils', () => ({
    createTypeMenuSections: jest.fn(),
    omitInsightsPageMenuItems: jest.fn(),
    omitTravelApprovalMenuItems: jest.fn(),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: jest.fn(() => [undefined]),
}));

jest.mock('@hooks/useCardFeedsForDisplay', () => ({
    __esModule: true,
    default: jest.fn(() => ({defaultCardFeed: undefined, cardFeedsByPolicy: {}, activeExpensifyCardFeedID: undefined})),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: jest.fn(() => ({isOffline: false})),
}));

jest.mock('@hooks/useMappedPolicies', () => ({
    __esModule: true,
    default: jest.fn(() => [{}]),
}));

jest.mock('@hooks/useHasReportAwaitingApproval', () => ({
    __esModule: true,
    default: jest.fn(() => false),
}));

jest.mock('@hooks/useCreateEmptyReportConfirmation', () => ({
    __esModule: true,
    default: jest.fn(() => ({openCreateReportConfirmation: jest.fn()})),
}));

const mockCreateTypeMenuSections = jest.mocked(createTypeMenuSections);
const mockUseHasReportAwaitingApproval = jest.mocked(useHasReportAwaitingApproval);
const SECTIONS: SearchTypeMenuSection[] = [{translationPath: 'common.spend', menuItems: []}];

describe('useSearchTypeMenuSections', () => {
    beforeEach(() => {
        mockCreateTypeMenuSections.mockReset();
        mockCreateTypeMenuSections.mockReturnValue(SECTIONS);
    });

    it('builds the sections by default', () => {
        // Given a consumer that does not pass shouldBuildSections, like the Search page type menu
        // When the hook renders
        const {result} = renderHook(() => useSearchTypeMenuSections());

        // Then the sections are built, so existing consumers keep their behavior
        expect(mockCreateTypeMenuSections).toHaveBeenCalledTimes(1);
        expect(result.current).toBe(SECTIONS);
    });

    it('skips building the sections while shouldBuildSections is false and builds them once it flips', () => {
        // Given the Search Router navigation source, which asks for no sections while the query is empty
        // When the hook renders with shouldBuildSections set to false
        const {result, rerender} = renderHook(({shouldBuildSections}) => useSearchTypeMenuSections(true, shouldBuildSections), {initialProps: {shouldBuildSections: false}});

        // Then no canned query is parsed and the same empty list is returned on every render
        const emptySections = result.current;
        expect(mockCreateTypeMenuSections).not.toHaveBeenCalled();
        expect(emptySections).toEqual([]);
        // And the approvals watch is frozen, since its result only feeds the sections
        expect(mockUseHasReportAwaitingApproval).toHaveBeenLastCalledWith(false);
        rerender({shouldBuildSections: false});
        expect(result.current).toBe(emptySections);

        // When the user types and the consumer asks for the sections
        rerender({shouldBuildSections: true});

        // Then the approvals watch resumes and the sections are built
        expect(mockUseHasReportAwaitingApproval).toHaveBeenLastCalledWith(true);
        expect(mockCreateTypeMenuSections).toHaveBeenCalledTimes(1);
        expect(result.current).toBe(SECTIONS);
    });
});
