import {act, screen} from '@testing-library/react-native';

import {CurrentReportIDContextProvider, useCurrentReportIDActions} from '@hooks/useCurrentReportID';

import Navigation from '@libs/Navigation/Navigation';
import {setHasRadio} from '@libs/NetworkState';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';

import type {NavigationState} from '@react-navigation/native';

import React, {createRef, useImperativeHandle} from 'react';
import Onyx from 'react-native-onyx';
import {measureRenders} from 'reassure';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('@libs/Permissions');
jest.mock('../../src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    isActiveRoute: jest.fn(),
    getTopmostReportId: jest.fn(),
    getActiveRoute: jest.fn(),
    getTopmostReportActionId: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isDisplayedInModal: jest.fn(() => false),
    getActiveRouteWithoutParams: jest.fn(() => ''),
}));
jest.mock('../../src/libs/Navigation/navigationRef', () => ({
    getState: () => ({
        routes: [{name: 'Report'}],
    }),
    getRootState: () => ({
        routes: [],
    }),
    addListener: () => () => {},
    isReady: () => true,
}));

jest.mock('@react-navigation/native');

const REPORT_COUNT = 500;
const CHANGES_PER_SCENARIO = 10;
const NAVIGATION_STATE: NavigationState = {key: 'root', index: 0, routeNames: ['Report'], routes: [{name: 'Report', key: 'Report'}], type: 'stack', stale: false};

const reports: ReportCollectionDataSet = Object.fromEntries(
    Array.from({length: REPORT_COUNT}, () => {
        const report = {...LHNTestUtils.getFakeReport([1, 2], 1, true), lastMessageText: 'hey'};
        return [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report];
    }),
);
const reportIDs = Object.values(reports)
    .map((report) => report?.reportID)
    .filter((reportID): reportID is string => !!reportID);

const updateCurrentReportIDRef = createRef<(state: NavigationState) => void>();

function CurrentReportIDUpdaterCapture() {
    const {updateCurrentReportID} = useCurrentReportIDActions();
    useImperativeHandle(updateCurrentReportIDRef, () => updateCurrentReportID, [updateCurrentReportID]);
    return null;
}

function SidebarLinksWithCurrentReportID() {
    return (
        <CurrentReportIDContextProvider>
            <CurrentReportIDUpdaterCapture />
            <LHNTestUtils.MockedSidebarLinks />
        </CurrentReportIDContextProvider>
    );
}

describe('SidebarLinks when the open report changes', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        // Required lazily so LHNTestUtils registers its @react-navigation/native mock before the engine's imports load it
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        require('@userActions/OnyxDerived').default();
    });

    beforeEach(async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        setHasRadio(true);
        await TestHelper.signInWithTestUser(1, 'email1@test.com', undefined, undefined, 'One');
        await waitForBatchedUpdates();

        // Given 500 reports in the LHN
        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
            ...reports,
        });
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    test('[SidebarLinks] should re-render when a different report is opened', async () => {
        let run = 0;
        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');

            // When the user opens a different report several times in a row, which changes the current report ID every row reads
            // but none of the rows' own data
            for (let index = 0; index < CHANGES_PER_SCENARIO; index++) {
                const reportID = reportIDs.at((run * CHANGES_PER_SCENARIO + index) % reportIDs.length);
                jest.mocked(Navigation.getTopmostReportId).mockReturnValue(reportID);
                await act(async () => {
                    updateCurrentReportIDRef.current?.(NAVIGATION_STATE);
                    await waitForBatchedUpdates();
                });
            }
            run++;
        };

        // Then reassure measures what switching the open report costs the LHN rows
        await measureRenders(<SidebarLinksWithCurrentReportID />, {scenario});
    });
});
