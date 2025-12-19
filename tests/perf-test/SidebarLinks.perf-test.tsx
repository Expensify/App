import {fireEvent, screen, waitFor} from '@testing-library/react-native';
import React, {useEffect, useState} from 'react';
import Onyx from 'react-native-onyx';
import {measureRenders} from 'reassure';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

function ExtraRenderWrapper({children}: {children: React.ReactNode}) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (count < 50) {
            setCount((c) => c + 1);
        }
    }, [count]);
    return <>{children}</>;
}

jest.mock('@libs/Permissions');
jest.mock('../../src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    isActiveRoute: jest.fn(),
    getTopmostReportId: jest.fn(),
    getActiveRoute: jest.fn(),
    getTopmostReportActionId: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isDisplayedInModal: jest.fn(() => false),
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
jest.mock('@components/Icon/Expensicons');

jest.mock('@react-navigation/native');
jest.mock('@src/hooks/useLHNEstimatedListSize/index.native.ts');

const getMockedReportsMap = (length = 100) => {
    const mockReports = Object.fromEntries(
        Array.from({length}, (value, index) => {
            const reportID = index + 1;
            const participants = [1, 2];
            const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
            const report = {...LHNTestUtils.getFakeReport(participants, 1, true), lastMessageText: 'hey'};

            return [reportKey, report];
        }),
    );

    return mockReports;
};

const mockedResponseMap = getMockedReportsMap(500);

describe('SidebarLinks', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        wrapOnyxWithWaitForBatchedUpdates(Onyx);

        // Initialize the network key for OfflineWithFeedback
        Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
        TestHelper.signInWithTestUser(1, 'email1@test.com', undefined, undefined, 'One').then(waitForBatchedUpdates);
    });

    afterEach(() => {
        Onyx.clear();
    });

    test('[SidebarLinks] should render Sidebar with 500 reports stored', async () => {
        const scenario = async () => {
            await screen.findByTestId('lhn-options-list');
        };

        await waitForBatchedUpdates();

        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
            ...mockedResponseMap,
        });

        await measureRenders(
            <ExtraRenderWrapper>
                <LHNTestUtils.MockedSidebarLinks />
            </ExtraRenderWrapper>,
            {scenario},
        );
    });

    test('[SidebarLinks] should click on list item', async () => {
        const scenario = async () => {
            // Wait for the sidebar container to be rendered first
            await waitFor(async () => {
                await screen.findByTestId('lhn-options-list');
            });

            // Then wait for the specific list item to be available
            const button = await screen.findByTestId('1');
            fireEvent.press(button);
        };
        await Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
            ...mockedResponseMap,
        });

        // Wait for Onyx to process the data
        await waitForBatchedUpdates();

        await measureRenders(<LHNTestUtils.MockedSidebarLinks />, {scenario});
    });
});
