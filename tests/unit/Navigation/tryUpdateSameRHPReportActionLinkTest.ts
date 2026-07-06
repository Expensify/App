import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import getFocusedRHPReportParams from '@libs/Navigation/helpers/getFocusedRHPReportParams';
import getReportActionIDFromReportLink from '@libs/Navigation/helpers/getReportActionIDFromReportLink';
import isReportOpenInRHP from '@libs/Navigation/helpers/isReportOpenInRHP';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import tryUpdateSameRHPReportActionLink from '@libs/Navigation/helpers/tryUpdateSameRHPReportActionLink';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {getReportIDFromLink} from '@libs/ReportUtils';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

jest.mock('@libs/getIsNarrowLayout', () => jest.fn());
jest.mock('@libs/Navigation/helpers/isReportOpenInRHP', () => jest.fn());
jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn());
jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());
jest.mock('@libs/Navigation/helpers/getReportActionIDFromReportLink', () => jest.fn());
jest.mock('@libs/Navigation/Navigation', () => ({
    setParams: jest.fn(),
}));
jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        getRootState: jest.fn(),
    },
}));
jest.mock('@libs/ReportUtils', () => ({
    getReportIDFromLink: jest.fn(),
}));

const mockGetIsNarrowLayout = getIsNarrowLayout as jest.MockedFunction<typeof getIsNarrowLayout>;
const mockIsReportOpenInRHP = isReportOpenInRHP as jest.MockedFunction<typeof isReportOpenInRHP>;
const mockIsReportTopmostSplitNavigator = isReportTopmostSplitNavigator as jest.MockedFunction<typeof isReportTopmostSplitNavigator>;
const mockIsSearchTopmostFullScreenRoute = isSearchTopmostFullScreenRoute as jest.MockedFunction<typeof isSearchTopmostFullScreenRoute>;
const mockGetReportActionIDFromReportLink = getReportActionIDFromReportLink as jest.MockedFunction<typeof getReportActionIDFromReportLink>;
const mockGetReportIDFromLink = getReportIDFromLink as jest.MockedFunction<typeof getReportIDFromLink>;
const mockSetParams = Navigation.setParams as jest.MockedFunction<typeof Navigation.setParams>;
const mockGetRootState = navigationRef.getRootState as unknown as jest.Mock;

const reportID = '12345';
const action1 = 'action1';
const action2 = 'action2';
const rhpNavKey = 'rhpNavKey';
const rhpRouteKey = 'rhpRouteKey';

function buildRHPRootState(focusedReportActionID = action1) {
    return {
        routes: [
            {
                name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
                state: {
                    key: rhpNavKey,
                    index: 0,
                    routes: [
                        {
                            key: rhpRouteKey,
                            name: SCREENS.RIGHT_MODAL.SEARCH_REPORT,
                            params: {reportID, reportActionID: focusedReportActionID},
                        },
                    ],
                },
            },
        ],
    };
}

describe('getFocusedRHPReportParams', () => {
    it('returns focused wide RHP report params', () => {
        const state = buildRHPRootState();
        expect(getFocusedRHPReportParams(state)).toEqual({
            reportID,
            reportActionID: action1,
            routeKey: rhpRouteKey,
            navigatorKey: rhpNavKey,
        });
    });

    it('returns undefined when the right modal is not open', () => {
        expect(getFocusedRHPReportParams({routes: [{name: NAVIGATORS.TAB_NAVIGATOR}]})).toBeUndefined();
    });
});

describe('tryUpdateSameRHPReportActionLink', () => {
    const href = `https://new.expensify.com/r/${reportID}/${action2}`;

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetIsNarrowLayout.mockReturnValue(false);
        mockIsReportOpenInRHP.mockReturnValue(true);
        mockIsReportTopmostSplitNavigator.mockReturnValue(true);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
        mockGetReportIDFromLink.mockReturnValue(reportID);
        mockGetReportActionIDFromReportLink.mockReturnValue(action2);
        mockGetRootState.mockReturnValue(buildRHPRootState());
    });

    it('returns false on narrow layout', () => {
        mockGetIsNarrowLayout.mockReturnValue(true);
        expect(tryUpdateSameRHPReportActionLink(href)).toBe(false);
        expect(mockSetParams).not.toHaveBeenCalled();
    });

    it('returns false when no report is open in the RHP', () => {
        mockIsReportOpenInRHP.mockReturnValue(false);
        expect(tryUpdateSameRHPReportActionLink(href)).toBe(false);
        expect(mockSetParams).not.toHaveBeenCalled();
    });

    it('returns false when not in inbox or search chat context', () => {
        mockIsReportTopmostSplitNavigator.mockReturnValue(false);
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
        expect(tryUpdateSameRHPReportActionLink(href)).toBe(false);
        expect(mockSetParams).not.toHaveBeenCalled();
    });

    it('returns false when the link targets a different report', () => {
        mockGetReportIDFromLink.mockReturnValue('other-report');
        expect(tryUpdateSameRHPReportActionLink(href)).toBe(false);
        expect(mockSetParams).not.toHaveBeenCalled();
    });

    it('returns false when the link has no reportActionID', () => {
        mockGetReportActionIDFromReportLink.mockReturnValue(undefined);
        expect(tryUpdateSameRHPReportActionLink(href)).toBe(false);
        expect(mockSetParams).not.toHaveBeenCalled();
    });

    it('returns true without setParams when the same report action is already focused', () => {
        mockGetReportActionIDFromReportLink.mockReturnValue(action1);
        mockGetRootState.mockReturnValue(buildRHPRootState(action1));
        expect(tryUpdateSameRHPReportActionLink(`https://new.expensify.com/r/${reportID}/${action1}`)).toBe(true);
        expect(mockSetParams).not.toHaveBeenCalled();
    });

    it('updates reportActionID in place for another comment link in the same open RHP report', () => {
        expect(tryUpdateSameRHPReportActionLink(href)).toBe(true);
        expect(mockSetParams).toHaveBeenCalledWith({reportActionID: action2}, rhpRouteKey, rhpNavKey);
    });
});
