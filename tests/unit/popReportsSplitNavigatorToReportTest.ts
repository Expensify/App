import popReportsSplitNavigatorToReport from '@libs/Navigation/helpers/popReportsSplitNavigatorToReport';
import navigationRef from '@libs/Navigation/navigationRef';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import {StackActions} from '@react-navigation/native';

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        getRootState: jest.fn(),
        dispatch: jest.fn(),
    },
}));

const SELF_DM_REPORT_ID = '123';
const OTHER_REPORT_ID = '456';
const SPLIT_NAV_KEY = 'splitNavKey';

// The mocked navigationRef has no `this` usage in its methods, so unbinding the references is safe.
/* eslint-disable @typescript-eslint/unbound-method */
const mockedGetRootState = navigationRef.getRootState as unknown as jest.Mock;
const mockedDispatch = navigationRef.dispatch as unknown as jest.Mock;
/* eslint-enable @typescript-eslint/unbound-method */

/**
 * Builds a minimal root navigation state shaped like:
 *   ROOT > TAB_NAVIGATOR > REPORTS_SPLIT_NAVIGATOR > [...splitRoutes]
 * where each entry in `splitRoutes` is either `{reportID}` or `null` to represent
 * a non-REPORT placeholder (e.g. sidebar).
 */
function buildRootStateWithSplitNavRoutes(splitRoutes: Array<{reportID: string} | null>, splitNavKey: string | undefined = SPLIT_NAV_KEY) {
    return {
        routes: [
            {
                name: NAVIGATORS.TAB_NAVIGATOR,
                state: {
                    routes: [
                        {
                            name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                            state: {
                                key: splitNavKey,
                                routes: splitRoutes.map((entry) => (entry ? {name: SCREENS.REPORT, params: {reportID: entry.reportID}} : {name: SCREENS.HOME})),
                            },
                        },
                    ],
                },
            },
        ],
    };
}

describe('popReportsSplitNavigatorToReport', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('no-ops when targetReportID is undefined', () => {
        popReportsSplitNavigatorToReport(undefined);
        expect(mockedGetRootState).not.toHaveBeenCalled();
        expect(mockedDispatch).not.toHaveBeenCalled();
    });

    it('no-ops when there is no TAB_NAVIGATOR in the root state', () => {
        mockedGetRootState.mockReturnValue({routes: [{name: NAVIGATORS.RIGHT_MODAL_NAVIGATOR}]});
        popReportsSplitNavigatorToReport(SELF_DM_REPORT_ID);
        expect(mockedDispatch).not.toHaveBeenCalled();
    });

    it('no-ops when there is no REPORTS_SPLIT_NAVIGATOR inside the TAB_NAVIGATOR', () => {
        mockedGetRootState.mockReturnValue({
            routes: [{name: NAVIGATORS.TAB_NAVIGATOR, state: {routes: [{name: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR}]}}],
        });
        popReportsSplitNavigatorToReport(SELF_DM_REPORT_ID);
        expect(mockedDispatch).not.toHaveBeenCalled();
    });

    it('no-ops when REPORTS_SPLIT_NAVIGATOR has no state key', () => {
        mockedGetRootState.mockReturnValue(buildRootStateWithSplitNavRoutes([null, {reportID: SELF_DM_REPORT_ID}], undefined));
        popReportsSplitNavigatorToReport(SELF_DM_REPORT_ID);
        expect(mockedDispatch).not.toHaveBeenCalled();
    });

    it('no-ops when the target report is not in the split navigator', () => {
        mockedGetRootState.mockReturnValue(buildRootStateWithSplitNavRoutes([null, {reportID: OTHER_REPORT_ID}]));
        popReportsSplitNavigatorToReport(SELF_DM_REPORT_ID);
        expect(mockedDispatch).not.toHaveBeenCalled();
    });

    it('no-ops when the target report is already on top of the split navigator', () => {
        mockedGetRootState.mockReturnValue(buildRootStateWithSplitNavRoutes([null, {reportID: SELF_DM_REPORT_ID}]));
        popReportsSplitNavigatorToReport(SELF_DM_REPORT_ID);
        expect(mockedDispatch).not.toHaveBeenCalled();
    });

    it('pops exactly one screen when one report is stacked above the target', () => {
        mockedGetRootState.mockReturnValue(buildRootStateWithSplitNavRoutes([null, {reportID: SELF_DM_REPORT_ID}, {reportID: OTHER_REPORT_ID}]));
        popReportsSplitNavigatorToReport(SELF_DM_REPORT_ID);
        expect(mockedDispatch).toHaveBeenCalledTimes(1);
        expect(mockedDispatch).toHaveBeenCalledWith({...StackActions.pop(1), target: SPLIT_NAV_KEY});
    });

    it('pops multiple screens when several reports are stacked above the target', () => {
        mockedGetRootState.mockReturnValue(
            buildRootStateWithSplitNavRoutes([null, {reportID: SELF_DM_REPORT_ID}, {reportID: OTHER_REPORT_ID}, {reportID: 'thread-1'}, {reportID: 'thread-2'}]),
        );
        popReportsSplitNavigatorToReport(SELF_DM_REPORT_ID);
        expect(mockedDispatch).toHaveBeenCalledTimes(1);
        expect(mockedDispatch).toHaveBeenCalledWith({...StackActions.pop(3), target: SPLIT_NAV_KEY});
    });

    it('uses the last (most recent) occurrence of REPORTS_SPLIT_NAVIGATOR when nested in multiple TAB_NAVIGATORs', () => {
        // Older TAB_NAVIGATOR contains an unrelated split navigator state — the helper must target the newest one only.
        mockedGetRootState.mockReturnValue({
            routes: [
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        routes: [
                            {
                                name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                                state: {key: 'oldSplit', routes: [{name: SCREENS.REPORT, params: {reportID: SELF_DM_REPORT_ID}}]},
                            },
                        ],
                    },
                },
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    state: {
                        routes: [
                            {
                                name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
                                state: {
                                    key: SPLIT_NAV_KEY,
                                    routes: [
                                        {name: SCREENS.HOME},
                                        {name: SCREENS.REPORT, params: {reportID: SELF_DM_REPORT_ID}},
                                        {name: SCREENS.REPORT, params: {reportID: OTHER_REPORT_ID}},
                                    ],
                                },
                            },
                        ],
                    },
                },
            ],
        });
        popReportsSplitNavigatorToReport(SELF_DM_REPORT_ID);
        expect(mockedDispatch).toHaveBeenCalledWith({...StackActions.pop(1), target: SPLIT_NAV_KEY});
    });

    it('pops to the most recent matching route when the target reportID appears more than once in the split navigator', () => {
        // Defensive: if the same reportID appears multiple times (params mismatch in real usage),
        // pop only screens stacked above the latest instance.
        mockedGetRootState.mockReturnValue(
            buildRootStateWithSplitNavRoutes([null, {reportID: SELF_DM_REPORT_ID}, {reportID: OTHER_REPORT_ID}, {reportID: SELF_DM_REPORT_ID}, {reportID: 'thread'}]),
        );
        popReportsSplitNavigatorToReport(SELF_DM_REPORT_ID);
        expect(mockedDispatch).toHaveBeenCalledWith({...StackActions.pop(1), target: SPLIT_NAV_KEY});
    });
});
