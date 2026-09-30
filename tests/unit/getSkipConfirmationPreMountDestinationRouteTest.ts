import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';

import getSkipConfirmationPreMountDestinationRoute from '@pages/iou/request/step/confirmation/getSkipConfirmationPreMountDestinationRoute';

import ROUTES from '@src/ROUTES';

const mockGetIsNarrowLayout = jest.fn<boolean, []>();
const mockGetTopmostReportId = jest.fn<string | undefined, []>();
const mockGetIsFullscreenPreInsertedUnderRHP = jest.fn<boolean, []>();

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute');
jest.mock('@libs/getIsNarrowLayout', () => () => mockGetIsNarrowLayout());
jest.mock('@libs/Navigation/Navigation', () => ({
    getTopmostReportId: () => mockGetTopmostReportId(),
    getIsFullscreenPreInsertedUnderRHP: () => mockGetIsFullscreenPreInsertedUnderRHP(),
}));

const mockIsSearchTopmostFullScreenRoute = jest.mocked(isSearchTopmostFullScreenRoute);

describe('getSkipConfirmationPreMountDestinationRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
        mockGetIsNarrowLayout.mockReturnValue(false);
        mockGetTopmostReportId.mockReturnValue(undefined);
        mockGetIsFullscreenPreInsertedUnderRHP.mockReturnValue(false);
    });

    it('returns undefined on wide layout when the destination is already the report on screen', () => {
        // Given a wide layout showing report 123, where a pre-mount would copy the whole tab navigator for nothing
        mockGetTopmostReportId.mockReturnValue('123');

        // When the skip-confirmation destination is that same report
        const route = getSkipConfirmationPreMountDestinationRoute(true, '123');

        // Then nothing is pre-mounted
        expect(route).toBeUndefined();
    });

    it('keeps the report route on wide layout once it is pre-mounted, so the hook does not tear its own pre-mount down', () => {
        // Given a wide pre-mount for report 123 already in place while 123 is also the topmost report
        mockGetTopmostReportId.mockReturnValue('123');
        mockGetIsFullscreenPreInsertedUnderRHP.mockReturnValue(true);

        // When the destination is derived again on re-render
        const route = getSkipConfirmationPreMountDestinationRoute(true, '123');

        // Then the route stays the same
        expect(route).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });

    it('still returns the report route on narrow layout when the destination is the report on screen', () => {
        // Given a narrow layout showing report 123, where the pre-insert reuses the existing route
        mockGetIsNarrowLayout.mockReturnValue(true);
        mockGetTopmostReportId.mockReturnValue('123');

        // When the skip-confirmation destination is that same report
        const route = getSkipConfirmationPreMountDestinationRoute(true, '123');

        // Then narrow behavior is unchanged
        expect(route).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });

    it('returns the report route when skip confirmation is eligible', () => {
        expect(getSkipConfirmationPreMountDestinationRoute(true, '123')).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });

    it('returns undefined when skip confirmation is disabled', () => {
        expect(getSkipConfirmationPreMountDestinationRoute(false, '123')).toBeUndefined();
    });

    it('returns undefined when Search is topmost', () => {
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);
        expect(getSkipConfirmationPreMountDestinationRoute(true, '123')).toBeUndefined();
    });

    it('returns undefined when reportID is missing', () => {
        expect(getSkipConfirmationPreMountDestinationRoute(true, undefined)).toBeUndefined();
    });

    it('returns undefined for a LOOKING_AROUND user whose expense lands in their self-DM (routed to Search, so no pre-insert)', () => {
        expect(getSkipConfirmationPreMountDestinationRoute(true, '123', true, true)).toBeUndefined();
    });

    it('still returns the report route for a LOOKING_AROUND user when the destination is NOT the self-DM', () => {
        expect(getSkipConfirmationPreMountDestinationRoute(true, '123', true, false)).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });

    it('still returns the report route for a self-DM destination when the user is NOT a LOOKING_AROUND user', () => {
        expect(getSkipConfirmationPreMountDestinationRoute(true, '123', false, true)).toEqual(ROUTES.REPORT_WITH_ID.getRoute('123'));
    });
});
