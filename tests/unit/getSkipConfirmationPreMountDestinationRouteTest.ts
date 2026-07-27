import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';

import getSkipConfirmationPreMountDestinationRoute from '@pages/iou/request/step/confirmation/getSkipConfirmationPreMountDestinationRoute';

import ROUTES from '@src/ROUTES';

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute');

const mockIsSearchTopmostFullScreenRoute = jest.mocked(isSearchTopmostFullScreenRoute);

describe('getSkipConfirmationPreMountDestinationRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
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
});
