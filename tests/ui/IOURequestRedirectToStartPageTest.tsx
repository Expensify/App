import {act, render} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation from '@libs/Navigation/Navigation';

import IOURequestRedirectToStartPage from '@pages/iou/request/IOURequestRedirectToStartPage';

import * as MoneyRequestActions from '@userActions/IOU/MoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@userActions/Tab');
jest.mock('@rnmapbox/maps', () => ({
    default: jest.fn(),
    MarkerView: jest.fn(),
    setAccessToken: jest.fn(),
}));

jest.mock('react-native-tab-view', () => ({
    TabView: 'TabView',
    SceneMap: jest.fn(),
    TabBar: 'TabBar',
}));

jest.mock('react-native-vision-camera', () => ({
    useCameraDevice: jest.fn(),
}));

// This page navigates on mount. Keep the real Navigation module (many modules depend on it) but stub the two
// methods the redirect calls so the test does not need a full navigator stack.
jest.mock('@libs/Navigation/Navigation', () => {
    const actualNavigation = jest.requireActual<{default: typeof Navigation}>('@libs/Navigation/Navigation').default;
    return {
        __esModule: true,
        default: {
            ...actualNavigation,
            dismissModal: jest.fn(),
            navigate: jest.fn(),
        },
    };
});

function getOptimisticDraft() {
    return new Promise<OnyxEntry<Transaction>>((resolve) => {
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`,
            callback: (value) => {
                resolve(value);
                Onyx.disconnect(connection);
            },
        });
    });
}

describe('IOURequestRedirectToStartPage', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.mocked(Navigation.navigate).mockClear();
        jest.mocked(Navigation.dismissModal).mockClear();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    // Covers the quick-action deeplink hand-off: a leftover "Scan receipt" draft under OPTIMISTIC_TRANSACTION_ID
    // has no waypoints, so if the redirect doesn't clear it the distance start page reads the wrong shape and the
    // waypoint flow opens "Not here". Checks that the redirect clears that draft before navigating.
    it('clears a stale scan draft when a quick-action deeplink starts a distance request', async () => {
        // Given a leftover "Scan receipt" draft under OPTIMISTIC_TRANSACTION_ID that has no distance waypoints
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {
                transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
                reportID: 'scanReport',
                comment: {},
            });
        });

        // sanity check: the stale draft exists before the redirect runs
        expect(await getOptimisticDraft()).not.toBeUndefined();

        // When the "Track distance" quick-action deeplink redirects through this page
        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <NavigationContainer>
                        <IOURequestRedirectToStartPage
                            route={{
                                key: 'Money_Request_Start-test',
                                name: SCREENS.MONEY_REQUEST.START,
                                params: {
                                    iouType: CONST.IOU.TYPE.CREATE,
                                    iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
                                    reportID: '',
                                    transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                                },
                            }}
                            report={undefined}
                            reportDraft={undefined}
                            // @ts-expect-error minimal navigation for test
                            navigation={undefined}
                        />
                    </NavigationContainer>
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the stale scan draft is cleared so the distance start page can rebuild a fresh draft with waypoints
        expect(await getOptimisticDraft()).toBeUndefined();

        // ...and the redirect still forwards the user to the distance start page
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
    });

    // Covers the cold-start / hard-refresh case where the draft collection isn't hydrated yet, so the selector
    // returns [] instead of undefined. Checks the clear still includes OPTIMISTIC_TRANSACTION_ID, since an empty
    // list would remove nothing and leave the stale draft behind.
    it('always clears the OPTIMISTIC_TRANSACTION_ID draft even when the selector returns an empty list', async () => {
        const clearSpy = jest.spyOn(MoneyRequestActions, 'clearMoneyRequest');

        // Given no loaded drafts (validTransactionDraftIDsSelector returns [])
        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <NavigationContainer>
                        <IOURequestRedirectToStartPage
                            route={{
                                key: 'Money_Request_Start-test',
                                name: SCREENS.MONEY_REQUEST.START,
                                params: {
                                    iouType: CONST.IOU.TYPE.CREATE,
                                    iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
                                    reportID: '',
                                    transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                                },
                            }}
                            report={undefined}
                            reportDraft={undefined}
                            // @ts-expect-error minimal navigation for test
                            navigation={undefined}
                        />
                    </NavigationContainer>
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then clearMoneyRequest is still called with OPTIMISTIC_TRANSACTION_ID in the removal list (exactly once)
        expect(clearSpy).toHaveBeenCalledTimes(1);
        expect(clearSpy).toHaveBeenCalledWith(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, expect.arrayContaining([CONST.IOU.OPTIMISTIC_TRANSACTION_ID]));

        clearSpy.mockRestore();
    });
});
