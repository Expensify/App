import {renderHook} from '@testing-library/react-native';

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
        const {result, rerender} = renderHook(({shouldBuildSections}) => useSearchTypeMenuSections(true, shouldBuildSections), {initialProps: {shouldBuildSections: false}});

        // Then no canned query is parsed and the same empty list is returned on every render
        const emptySections = result.current;
        expect(mockCreateTypeMenuSections).not.toHaveBeenCalled();
        expect(emptySections).toEqual([]);
        rerender({shouldBuildSections: false});
        expect(result.current).toBe(emptySections);

        // When the user types and the consumer asks for the sections
        rerender({shouldBuildSections: true});

        // Then the sections are built
        expect(mockCreateTypeMenuSections).toHaveBeenCalledTimes(1);
        expect(result.current).toBe(SECTIONS);
    });
});
