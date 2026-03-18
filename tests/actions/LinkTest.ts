/* eslint-disable @typescript-eslint/naming-convention */
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import asyncOpenURL from '@libs/asyncOpenURL';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import shouldPreserveWideRHPReportOriginForInternalLink from '@libs/Navigation/helpers/shouldPreserveWideRHPReportOriginForInternalLink';
import * as Url from '@libs/Url';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import {openLink} from '@userActions/Link';

jest.mock('react-native-onyx', () => {
    const onyx = {
        connectWithoutView: jest.fn(),
    };

    return {
        __esModule: true,
        default: onyx,
    };
});

jest.mock('@libs/API', () => ({
    makeRequestWithSideEffects: jest.fn(),
}));
jest.mock('@libs/asyncOpenURL', () => jest.fn());
jest.mock('@libs/Environment/Environment', () => ({
    getOldDotEnvironmentURL: jest.fn(),
}));
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());
jest.mock('@libs/isPublicScreenRoute', () => jest.fn());
jest.mock('@libs/Navigation/helpers/shouldPreserveWideRHPReportOriginForInternalLink', () => jest.fn());
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        closeRHPFlow: jest.fn(),
        navigate: jest.fn(),
    },
}));
jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        getRootState: jest.fn(),
    },
}));
jest.mock('@libs/ReportUtils', () => ({
    findLastAccessedReport: jest.fn(),
    getReportIDFromLink: jest.fn(),
    getRouteFromLink: jest.fn(),
}));
jest.mock('@libs/shouldSkipDeepLinkNavigation', () => jest.fn());
jest.mock('@libs/Url', () => ({
    hasSameExpensifyOrigin: jest.fn(),
    getPathFromURL: jest.fn(),
}));
jest.mock('@userActions/Report', () => ({
    doneCheckingPublicRoom: jest.fn(),
    navigateToConciergeChat: jest.fn(),
    openReport: jest.fn(),
}));
jest.mock('@userActions/Session', () => ({
    canAnonymousUserAccessRoute: jest.fn(() => true),
    isAnonymousUser: jest.fn(() => false),
    signOutAndRedirectToSignIn: jest.fn(),
    waitForUserSignIn: jest.fn(() => Promise.resolve()),
}));
jest.mock('@userActions/Welcome', () => ({
    setOnboardingErrorMessage: jest.fn(),
}));

const mockedNavigation = Navigation as jest.Mocked<typeof Navigation>;
const mockedNavigationRef = navigationRef as jest.Mocked<typeof navigationRef>;
const mockedAsyncOpenURL = asyncOpenURL as jest.MockedFunction<typeof asyncOpenURL>;
const mockedGetIsNarrowLayout = getIsNarrowLayout as jest.MockedFunction<typeof getIsNarrowLayout>;
const mockedShouldPreserveWideRHPReportOriginForInternalLink = shouldPreserveWideRHPReportOriginForInternalLink as jest.MockedFunction<
    typeof shouldPreserveWideRHPReportOriginForInternalLink
>;
const mockedUrl = Url as jest.Mocked<typeof Url>;

describe('actions/Link.openLink', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedGetIsNarrowLayout.mockReturnValue(false);
        mockedNavigationRef.getRootState.mockReturnValue({
            routes: [{name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR}],
        } as never);
        mockedUrl.getPathFromURL.mockImplementation((href) => new URL(href).pathname.slice(1));
        mockedUrl.hasSameExpensifyOrigin.mockImplementation((href, origin) => href.startsWith(origin));
    });

    it('preserves the visible wide RHP origin for internal non-RHP routes', () => {
        mockedShouldPreserveWideRHPReportOriginForInternalLink.mockReturnValue(true);

        openLink('https://dev.new.expensify.com:8082/r/123/456', CONST.DEV_NEW_EXPENSIFY_URL);

        expect(mockedNavigation.closeRHPFlow).not.toHaveBeenCalled();
        expect(mockedNavigation.navigate).toHaveBeenCalledWith('r/123/456');
    });

    it('keeps the existing close-then-navigate behavior when the helper opts out', () => {
        mockedShouldPreserveWideRHPReportOriginForInternalLink.mockReturnValue(false);

        openLink('https://dev.new.expensify.com:8082/r/123/456', CONST.DEV_NEW_EXPENSIFY_URL);

        expect(mockedNavigation.closeRHPFlow).toHaveBeenCalledTimes(1);
        expect(mockedNavigation.navigate).toHaveBeenCalledWith('r/123/456');
    });

    it('does not close RHP when the internal target stays inside RHP', () => {
        mockedShouldPreserveWideRHPReportOriginForInternalLink.mockReturnValue(false);

        openLink('https://dev.new.expensify.com:8082/e/123?backTo=%2Fr%2F456', CONST.DEV_NEW_EXPENSIFY_URL);

        expect(mockedNavigation.closeRHPFlow).not.toHaveBeenCalled();
        expect(mockedNavigation.navigate).toHaveBeenCalledWith('e/123');
    });

    it('does not close RHP on narrow layouts for internal non-RHP routes', () => {
        mockedGetIsNarrowLayout.mockReturnValue(true);
        mockedShouldPreserveWideRHPReportOriginForInternalLink.mockReturnValue(false);

        openLink('https://dev.new.expensify.com:8082/r/123/456', CONST.DEV_NEW_EXPENSIFY_URL);

        expect(mockedNavigation.closeRHPFlow).not.toHaveBeenCalled();
        expect(mockedNavigation.navigate).toHaveBeenCalledWith('r/123/456');
    });

    it('does not close RHP when the current topmost route is not RHP', () => {
        mockedShouldPreserveWideRHPReportOriginForInternalLink.mockReturnValue(false);
        mockedNavigationRef.getRootState.mockReturnValue({
            routes: [{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}],
        } as never);

        openLink('https://dev.new.expensify.com:8082/r/123/456', CONST.DEV_NEW_EXPENSIFY_URL);

        expect(mockedNavigation.closeRHPFlow).not.toHaveBeenCalled();
        expect(mockedNavigation.navigate).toHaveBeenCalledWith('r/123/456');
    });

    it('opens external links without touching navigation', () => {
        mockedUrl.hasSameExpensifyOrigin.mockReturnValue(false);

        openLink('https://example.com/path', CONST.DEV_NEW_EXPENSIFY_URL);

        expect(mockedNavigation.closeRHPFlow).not.toHaveBeenCalled();
        expect(mockedNavigation.navigate).not.toHaveBeenCalled();
        expect(mockedAsyncOpenURL).toHaveBeenCalled();
    });
});
