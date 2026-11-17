import {act, render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import OptionRowLHNData from '@components/LHNOptionsList/OptionRowLHN';
import type {OptionRowLHNProps} from '@components/LHNOptionsList/types';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {CurrentReportIDContextProvider, useCurrentReportIDActions} from '@hooks/useCurrentReportID';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';

import type {NavigationState} from '@react-navigation/native';

import React, {useEffect} from 'react';
import Onyx from 'react-native-onyx';

import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const mockOnRowRender = jest.fn<void, [string | undefined, boolean]>();

// Record the focus state each row passes down instead of rendering the full row UI.
jest.mock('@components/LHNOptionsList/OptionRowLHN/OptionRowLHN', () => ({
    __esModule: true,
    default: ({optionItem, isOptionFocused = false}: OptionRowLHNProps) => {
        mockOnRowRender(optionItem.reportID, isOptionFocused);
        return null;
    },
}));

jest.mock('@libs/Permissions');
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    isActiveRoute: jest.fn(),
    getTopmostReportId: jest.fn(),
    getActiveRoute: jest.fn(),
    getTopmostReportActionId: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isDisplayedInModal: jest.fn(() => false),
    getActiveRouteWithoutParams: jest.fn(() => ''),
}));
jest.mock('@react-navigation/native');

const NAVIGATION_STATE = {key: 'root', index: 0, routeNames: ['Report'], routes: [{name: 'Report', key: 'Report'}], type: 'stack', stale: false} as NavigationState;

const reports: ReportCollectionDataSet = Object.fromEntries(
    [1, 2, 3].map((i) => {
        const report = {...LHNTestUtils.getFakeReport([1, 2], i * 60000, false), lastMessageText: 'hey'};
        return [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report];
    }),
);
const [firstReportID = '', secondReportID = '', thirdReportID = ''] = Object.values(reports).map((report) => report?.reportID);

function NavigateTo({reportID}: {reportID: string}) {
    const {updateCurrentReportID} = useCurrentReportIDActions();
    useEffect(() => {
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue(reportID);
        updateCurrentReportID(NAVIGATION_STATE);
    }, [reportID, updateCurrentReportID]);
    return null;
}

function Rows({currentReportID}: {currentReportID: string}) {
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, CurrentReportIDContextProvider]}>
            <NavigateTo reportID={currentReportID} />
            {[firstReportID, secondReportID, thirdReportID].map((reportID, index) => (
                <OptionRowLHNData
                    key={reportID}
                    reportID={reportID}
                    isOptionFocused
                    testID={index}
                />
            ))}
        </ComposeProviders>
    );
}

function getFocusedReportIDs() {
    const lastFocusByReportID = new Map<string | undefined, boolean>();
    for (const [reportID, isFocused] of mockOnRowRender.mock.calls) {
        lastFocusByReportID.set(reportID, isFocused);
    }
    return [...lastFocusByReportID].filter(([, isFocused]) => isFocused).map(([reportID]) => reportID);
}

describe('OptionRowLHNData focus', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        global.fetch = TestHelper.getGlobalFetchMock();
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        await TestHelper.signInWithTestUser(1, 'email1@test.com', undefined, undefined, 'One');
        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
            ...reports,
        });
        await waitForBatchedUpdates();
        mockOnRowRender.mockClear();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('moves the highlight from the old current report row to the new one', async () => {
        // Given the first report is the current one
        const {rerender} = render(<Rows currentReportID={firstReportID} />);
        await act(waitForBatchedUpdates);
        expect(getFocusedReportIDs()).toEqual([firstReportID]);

        // When the user opens the second report
        rerender(<Rows currentReportID={secondReportID} />);
        await act(waitForBatchedUpdates);

        // Then only the second row is highlighted
        expect(getFocusedReportIDs()).toEqual([secondReportID]);
    });
});
