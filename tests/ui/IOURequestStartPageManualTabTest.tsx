import {act, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import IOURequestStartPage from '@pages/iou/request/IOURequestStartPage';

import type {IOURequestType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = '1';
const TRANSACTION_ID = 'transaction1';
const CONFIRMATION_TEST_ID = 'EmbeddedConfirmation';
const LOADER_TEST_ID = 'manualTabPendingReset';

jest.mock('@userActions/Tab');
jest.mock('@rnmapbox/maps', () => ({
    default: jest.fn(),
    MarkerView: jest.fn(),
    setAccessToken: jest.fn(),
}));

jest.mock('react-native-vision-camera', () => ({
    useCameraDevice: jest.fn(),
}));

// The page is rendered outside a navigator screen, so give the hooks that read the route a static one.
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useRoute: () => ({key: 'Money_Request_Create-1', name: 'Money_Request_Create', params: {}}),
    usePreventRemove: jest.fn(),
}));

// Render every tab screen inline so the manual tab content is mounted without driving the real tab navigator.
jest.mock('@libs/Navigation/OnyxTabNavigator', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    return {
        __esModule: true,
        default: ({children}: {children: React.ReactNode}) => ReactModule.createElement(ReactModule.Fragment, null, children),
        TopTab: {
            Screen: ({children}: {children: () => React.ReactNode}) => ReactModule.createElement(ReactModule.Fragment, null, typeof children === 'function' ? children() : children),
        },
        TabScreenWithFocusTrapWrapper: ({children}: {children: React.ReactNode}) => ReactModule.createElement(ReactModule.Fragment, null, children),
    };
});

// The tabs we don't assert on are stubbed out - this suite only cares about which content the manual tab picks.
jest.mock('@pages/iou/request/step/IOURequestStepScan', () => () => null);
jest.mock('@pages/iou/request/step/IOURequestStepConfirmation', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<{View: React.ComponentType<{testID: string}>}>('react-native');
    return {
        __esModule: true,
        default: () => ReactModule.createElement(View, {testID: 'EmbeddedConfirmation'}),
    };
});

describe('IOURequestStartPage manual tab content', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    /**
     * Seeds the beta, the manual tab selection and a draft transaction of the given request type, then renders the page.
     */
    async function renderStartPageWithDraftType(iouRequestType: IOURequestType) {
        await act(async () => {
            await Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.NEW_MANUAL_EXPENSE_FLOW]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.IOU_REQUEST_TYPE}`, CONST.TAB_REQUEST.MANUAL);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                transactionID: TRANSACTION_ID,
                iouRequestType,
                // Matching the route's reportID keeps useResetIOUType's focus effect from rebuilding the draft,
                // so the draft stays in the "not reset yet" state this test is about.
                reportID: REPORT_ID,
            });
        });

        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <NavigationContainer>
                        <IOURequestStartPage
                            route={{
                                key: 'Money_Request_Create-1',
                                name: SCREENS.MONEY_REQUEST.CREATE,
                                // @ts-expect-error the create route types `backTo` and `action` as never, so its params can't be built here.
                                params: {iouType: CONST.IOU.TYPE.SUBMIT, reportID: REPORT_ID, transactionID: TRANSACTION_ID},
                            }}
                            report={undefined}
                            reportDraft={undefined}
                            // @ts-expect-error the page under test doesn't call into navigation.
                            navigation={undefined}
                            defaultSelectedTab={CONST.TAB_REQUEST.MANUAL}
                        />
                    </NavigationContainer>
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();
    }

    it('shows a loader instead of the embedded confirmation while a per diem draft is still pending its reset to manual', async () => {
        // Given the new manual expense flow beta and a draft that is still a per diem request
        await renderStartPageWithDraftType(CONST.IOU.REQUEST_TYPE.PER_DIEM);

        // Then the manual tab waits for the reset instead of mounting the confirmation against the per diem draft
        expect(screen.getByTestId(LOADER_TEST_ID)).toBeOnTheScreen();
        expect(screen.queryByTestId(CONFIRMATION_TEST_ID)).not.toBeOnTheScreen();
    });

    it('shows a loader instead of the embedded confirmation while a scan draft is still pending its reset to manual', async () => {
        // Given the new manual expense flow beta and a draft that is still a scan request
        await renderStartPageWithDraftType(CONST.IOU.REQUEST_TYPE.SCAN);

        // Then the manual tab waits for the reset instead of mounting the confirmation against the scan draft
        expect(screen.getByTestId(LOADER_TEST_ID)).toBeOnTheScreen();
        expect(screen.queryByTestId(CONFIRMATION_TEST_ID)).not.toBeOnTheScreen();
    });

    it('shows the embedded confirmation once the draft is a manual request', async () => {
        // Given the new manual expense flow beta and a draft that has been reset to a manual request
        await renderStartPageWithDraftType(CONST.IOU.REQUEST_TYPE.MANUAL);

        // Then the confirmation is mounted and the pending-reset loader is gone
        expect(screen.getByTestId(CONFIRMATION_TEST_ID)).toBeOnTheScreen();
        expect(screen.queryByTestId(LOADER_TEST_ID)).not.toBeOnTheScreen();
    });
});
