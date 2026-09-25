import {act, render} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Navigation from '@libs/Navigation/Navigation';

import IOURequestRedirectToStartPage from '@pages/iou/request/IOURequestRedirectToStartPage';

import * as MoneyRequestActions from '@userActions/IOU/MoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
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

// Stands in for the module-level navigation-ready promise so each test can decide whether the NavigationContainer
// is already up (in-app navigation) or still initializing (cold load from the address bar).
const mockNavigationReady = {
    promise: Promise.resolve(),
    resolve: () => {},
};

function resetNavigationReady() {
    mockNavigationReady.promise = new Promise<void>((resolve) => {
        mockNavigationReady.resolve = resolve;
    });
}

// This page navigates on mount. Keep the real Navigation module (many modules depend on it) but stub the methods
// the redirect calls so the test does not need a full navigator stack.
jest.mock('@libs/Navigation/Navigation', () => {
    const actualNavigation = jest.requireActual<{default: typeof Navigation}>('@libs/Navigation/Navigation').default;
    return {
        __esModule: true,
        default: {
            ...actualNavigation,
            dismissModal: jest.fn(),
            navigate: jest.fn(),
            isNavigationReady: jest.fn(() => mockNavigationReady.promise),
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

type RedirectRouteParams = NonNullable<React.ComponentProps<typeof IOURequestRedirectToStartPage>['route']['params']>;

function renderRedirectPage(params: RedirectRouteParams) {
    return render(
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <NavigationContainer>
                    <IOURequestRedirectToStartPage
                        route={{
                            key: 'Money_Request_Start-test',
                            name: SCREENS.MONEY_REQUEST.START,
                            params,
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
}

/** Resolves the navigation-ready promise, standing in for the NavigationContainer finishing its initialization. */
async function markNavigationReady() {
    await act(async () => {
        mockNavigationReady.resolve();
        await mockNavigationReady.promise;
    });
    await waitForBatchedUpdatesWithAct();
}

describe('IOURequestRedirectToStartPage', () => {
    // the distance redirect reads GetDefaultP2PMileageRate, so stub the network instead of hitting real fetch
    TestHelper.setupGlobalFetchMock();

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.mocked(Navigation.navigate).mockClear();
        jest.mocked(Navigation.dismissModal).mockClear();
        resetNavigationReady();
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
        renderRedirectPage({
            iouType: CONST.IOU.TYPE.CREATE,
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
            reportID: '',
            transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
        });
        await waitForBatchedUpdatesWithAct();
        await markNavigationReady();

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
        renderRedirectPage({
            iouType: CONST.IOU.TYPE.CREATE,
            iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE_MAP,
            reportID: '',
            transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
        });
        await waitForBatchedUpdatesWithAct();

        // Then clearMoneyRequest is still called with OPTIMISTIC_TRANSACTION_ID in the removal list (exactly once)
        expect(clearSpy).toHaveBeenCalledTimes(1);
        expect(clearSpy).toHaveBeenCalledWith(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, expect.arrayContaining([CONST.IOU.OPTIMISTIC_TRANSACTION_ID]));

        clearSpy.mockRestore();
    });

    // Regression test for the cold-load bug: pasting /start/<iouType>/manual into the address bar mounts this page
    // before the NavigationContainer is ready. Without a readiness guard the dismiss and the redirect are deferred
    // through different mechanisms and setIsNavigationReady() replays them in the wrong order (push, then dismiss),
    // so the create modal is torn down again and the user is left on the fullscreen page behind it.
    it('defers the dismiss and the redirect until navigation is ready, in that order', async () => {
        // Given a cold load: the NavigationContainer has not signalled readiness yet
        renderRedirectPage({
            iouType: CONST.IOU.TYPE.SUBMIT,
            iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
            reportID: '',
            transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
        });
        await waitForBatchedUpdatesWithAct();

        // Then nothing is dispatched while the container is still initializing
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();

        // When the container becomes ready
        await markNavigationReady();

        // Then the modal is dismissed and the user is forwarded to the manual start page exactly once
        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);

        // the reportID is generated on the fly, so read it back off the route and rebuild the expected one
        const navigatedRoute: string = jest.mocked(Navigation.navigate).mock.calls.at(0)?.[0] ?? '';
        const optimisticReportID = /\/(\d+)\/manual$/.exec(navigatedRoute)?.at(1) ?? '';
        expect(optimisticReportID).not.toBe('');
        expect(navigatedRoute).toBe(ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, optimisticReportID));

        // ...and the dismiss runs before the redirect, so the newly pushed modal is not immediately torn down
        const dismissOrder = jest.mocked(Navigation.dismissModal).mock.invocationCallOrder.at(0) ?? 0;
        const navigateOrder = jest.mocked(Navigation.navigate).mock.invocationCallOrder.at(0) ?? 0;
        expect(dismissOrder).toBeLessThan(navigateOrder);
    });

    // Regression test for the second half of the reported bug: /start/request/manual opened the create modal but its
    // body rendered "Not found", because `request` is a deprecated OldDot alias that withWritableReportOrNotFound
    // rejects. The redirect resolves the alias so the route it builds carries a type the create flow accepts.
    it.each([
        [CONST.IOU.TYPE.REQUEST, CONST.IOU.TYPE.SUBMIT],
        [CONST.IOU.TYPE.SEND, CONST.IOU.TYPE.PAY],
    ])('redirects the deprecated %s deeplink to the %s create route', async (deprecatedIOUType, expectedIOUType) => {
        // Given a /start/<deprecated type>/manual link
        renderRedirectPage({
            iouType: deprecatedIOUType,
            iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
            reportID: '',
            transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
        });
        await waitForBatchedUpdatesWithAct();
        await markNavigationReady();

        // Then the create route is built with the modern iouType, not the deprecated alias
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        const navigatedRoute: string = jest.mocked(Navigation.navigate).mock.calls.at(0)?.[0] ?? '';
        const optimisticReportID = /\/(\d+)\/manual$/.exec(navigatedRoute)?.at(1) ?? '';
        expect(optimisticReportID).not.toBe('');
        expect(navigatedRoute).toBe(ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL.getRoute(CONST.IOU.ACTION.CREATE, expectedIOUType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, optimisticReportID));
    });

    // The readiness guard makes the redirect async, so the page can be unmounted while it is still pending. Nothing
    // should be dispatched in that case: dismissModal() tears down whatever modal is on top, so a late replay would
    // dismiss a modal this page never opened and push the start page over it.
    it('does not dismiss or redirect when the page unmounts before navigation is ready', async () => {
        // Given a cold load that unmounts before the NavigationContainer signals readiness
        const {unmount} = renderRedirectPage({
            iouType: CONST.IOU.TYPE.SUBMIT,
            iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
            reportID: '',
            transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
        });
        await waitForBatchedUpdatesWithAct();
        act(() => {
            unmount();
        });

        // When the container becomes ready after the page is gone
        await markNavigationReady();

        // Then the queued dismiss and redirect are both dropped
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});
