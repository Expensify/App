/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {readFileAsync} from '@libs/fileDownload/FileUtils';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import ReceiptStorage from '@libs/ReceiptStorage';
import {getReportOrDraftReport} from '@libs/ReportUtils';
import {Scheduler} from '@libs/Scheduler';

import SubmitDetailsPage from '@pages/Share/SubmitDetailsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Report, Transaction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import type * as FileUtilsModule from '../../src/libs/fileDownload/FileUtils';

import * as TrackExpense from '../../src/libs/actions/IOU/TrackExpense';
import cleanupAndNavigateAfterExpenseCreate from '../../src/libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate';
import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type GetReportOrDraftReportFn = typeof getReportOrDraftReport;
type ReportUtilsActual = Record<string, unknown> & {getReportOrDraftReport: GetReportOrDraftReportFn};

jest.mock('@libs/actions/IOU/TrackExpense', () => {
    const actual = jest.requireActual<typeof TrackExpense>('@libs/actions/IOU/TrackExpense');
    return {
        ...actual,
        requestMoney: jest.fn(() => ({iouReport: undefined})),
        trackExpense: jest.fn(),
    };
});

jest.mock('@libs/ReportUtils', () => {
    const actual = jest.requireActual<ReportUtilsActual>('@libs/ReportUtils');
    return {
        ...actual,
        getReportOrDraftReport: jest.fn(actual.getReportOrDraftReport),
    };
});

// Guards against error #1: cleanup navigation targeting a different transaction than requestMoney created.
jest.mock('@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate', () => jest.fn());

jest.mock('@libs/fileDownload/FileUtils', () => {
    const actual = jest.requireActual<typeof FileUtilsModule>('@libs/fileDownload/FileUtils');
    return {
        ...actual,
        // Drives confirm → performUpload → finishRequestAndNavigate for tests #1, #2, #3, and #4.
        readFileAsync: jest.fn((_uri: string, name: string, onSuccess: (file: {name: string; uri: string}) => void) => {
            onSuccess({name, uri: 'file://test-receipt.jpg'});
        }),
    };
});

// Jest resolves the bare specifier to the web no-op, so mock the shape and let each test opt into the native move.
jest.mock('@libs/ReceiptStorage', () => ({
    __esModule: true,
    default: {
        adopt: jest.fn((uriOrPath: string) => Promise.resolve(uriOrPath)),
        toLocalUri: jest.fn((durableName: string) => durableName),
        resolve: jest.fn((source: string) => source),
    },
}));

jest.mock('@libs/getCurrentPosition', () => jest.fn());

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: 1, login: 'tester@example.com', displayName: 'Tester'})));

jest.mock('@hooks/usePolicyForTransaction', () => jest.fn(() => ({policy: undefined})));

jest.mock('@hooks/usePersonalPolicy', () => jest.fn(() => undefined));

jest.mock('@hooks/usePrivateIsArchivedMap', () => jest.fn(() => ({})));

jest.mock('@hooks/useReportAttributes', () => jest.fn(() => ({})));

jest.mock('@hooks/useReportIsArchived', () => jest.fn(() => false));

// `type: 'chat'` is the CONST.REPORT.TYPE.CHAT literal — inlined because jest.mock factories can't reference imports.
// eslint-disable-next-line @typescript-eslint/naming-convention -- numeric account IDs are the Onyx participants key shape
jest.mock('@hooks/useReportOrReportDraft', () => jest.fn((reportID?: string) => (reportID ? {reportID, participants: {1: {}, 2: {}}, type: 'chat'} : undefined)));

jest.mock('@libs/getIsNarrowLayout', () => jest.fn(() => true));

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: jest.fn(({callback}: {callback: () => void}) => {
        callback();
        return {cancel: jest.fn()};
    }),
}));

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn(() => false));

jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => jest.fn(() => false));

jest.mock('@libs/Navigation/helpers/isReportOpenInRHP', () => jest.fn(() => false));

jest.mock('@libs/Scheduler', () => ({
    Scheduler: {
        scheduleWhenIdle: jest.fn((callback: () => void) => {
            callback();
            return {cancel: jest.fn()};
        }),
    },
}));

// Infrastructure for usePreMountDestination (added to SubmitDetailsPage): without these, render throws
// "getTopmostReportId is not a function" and tests never reach their assertions.
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getReportRouteByID: jest.fn(() => undefined),
    removeScreenByKey: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((cb: () => void) => cb()),
    dismissModal: jest.fn((options?: {afterTransition?: () => void}) => {
        options?.afterTransition?.();
    }),
    dismissModalWithReport: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    getActiveRoute: jest.fn(() => ''),
    getTopmostReportId: jest.fn(() => 'report-share-1'),
    getIsFullscreenPreInsertedUnderRHP: jest.fn(() => false),
    getPreInsertedFullscreenRouteName: jest.fn(() => undefined),
    clearFullscreenPreInsertedFlag: jest.fn(),
    revealRouteBeforeDismissingModal: jest.fn((_route: unknown, options?: {afterTransition?: () => void}) => {
        options?.afterTransition?.();
    }),
    preInsertFullscreenUnderRHP: jest.fn(),
    removePreInsertedFullscreenIfNeeded: jest.fn(),
    navigationRef: {
        getCurrentRoute: jest.fn(() => ({name: 'Share', key: 'Share'})),
        getState: jest.fn(() => ({routes: [{name: 'Share', key: 'Share'}]})),
        getRootState: jest.fn(() => ({routes: [{name: 'Share', key: 'Share'}], stale: false})),
    },
}));

jest.mock('@pages/Share/ShareRootPage', () => ({showErrorAlert: jest.fn()}));

jest.mock('@pages/Share/useShareFileSizeValidation', () => jest.fn());

jest.mock('@components/HeaderWithBackButton', () => {
    const React2 = require('react');
    const {Pressable, Text} = require('react-native');
    return {
        __esModule: true,
        default: ({onBackButtonPress}: {onBackButtonPress?: () => void}) =>
            React2.createElement(Pressable, {testID: 'mock-back-button', onPress: onBackButtonPress}, React2.createElement(Text, null, 'back')),
    };
});

// Mock the confirmation list down to a button that fires onConfirm — isolates the test from the form internals.
jest.mock('@components/MoneyRequestConfirmationList', () => {
    const React2 = require('react');
    const {Pressable, Text} = require('react-native');
    return {
        __esModule: true,
        default: ({onConfirm}: {onConfirm: (participants?: Array<{accountID: number; login: string}>) => void}) =>
            React2.createElement(
                Pressable,
                {testID: 'mock-confirm-button', onPress: () => onConfirm([{accountID: 2, login: 'participant@example.com'}])},
                React2.createElement(Text, null, 'confirm'),
            ),
    };
});

const SHARED_REPORT_ID = 'report-share-1';
const ACCOUNT_ID = 1;
const PARTICIPANT_ACCOUNT_ID = 2;

function createTestReport(): Report {
    return {
        reportID: SHARED_REPORT_ID,
        chatType: CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
        ownerAccountID: 1,
        type: CONST.REPORT.TYPE.CHAT,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        isPinned: false,
        lastVisibleActionCreated: '',
        lastReadTime: '',
        participants: {
            [ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, role: CONST.REPORT.ROLE.MEMBER},
            [PARTICIPANT_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, role: CONST.REPORT.ROLE.MEMBER},
        },
    };
}

function createDraftTransaction(): Transaction {
    return {
        transactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
        amount: 1000,
        currency: 'USD',
        merchant: 'Test Merchant',
        created: '2026-05-21',
        reportID: SHARED_REPORT_ID,
        comment: {comment: ''},
        category: '',
        tag: '',
    } as Transaction;
}

// Seed the shared Onyx state all tests drive: a chat report, a draft transaction, and the shared file.
async function seedShareState() {
    await act(async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${SHARED_REPORT_ID}`, createTestReport());
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, createDraftTransaction());
        await Onyx.merge(ONYXKEYS.SHARE_TEMP_FILE, {content: 'file://shared.jpg', mimeType: 'image/jpeg'});
        // Recent prompt timestamp skips the location-permission modal so onConfirm goes straight to performUpload → finishRequestAndNavigate.
        await Onyx.merge(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, new Date().toISOString());
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [PARTICIPANT_ACCOUNT_ID]: {accountID: PARTICIPANT_ACCOUNT_ID, login: 'participant@example.com', displayName: 'Participant'},
        });
    });
}

// Render the page and press the mocked confirm button — the single entry point submit tests exercise.
async function renderAndConfirm() {
    renderSubmitDetailsPage();
    await waitForBatchedUpdatesWithAct();
    fireEvent.press(screen.getByTestId('mock-confirm-button'));
    await waitForBatchedUpdatesWithAct();
}

function renderSubmitDetailsPage() {
    return render(
        <SubmitDetailsPage
            route={{key: 'submit-test', name: SCREENS.SHARE.SUBMIT_DETAILS, params: {reportOrAccountID: SHARED_REPORT_ID}}}
            navigation={createMock<React.ComponentProps<typeof SubmitDetailsPage>['navigation']>({})}
        />,
    );
}

function resetNavigationMocksForSubmitDetailsPageTests() {
    jest.mocked(Navigation.getTopmostReportId).mockReturnValue('report-share-1');
    jest.mocked(getIsNarrowLayout).mockReturnValue(true);
    jest.mocked(Navigation.getIsFullscreenPreInsertedUnderRHP).mockReturnValue(false);
    jest.mocked(Navigation.preInsertFullscreenUnderRHP).mockImplementation(() => {
        jest.mocked(Navigation.getIsFullscreenPreInsertedUnderRHP).mockReturnValue(true);
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue(SHARED_REPORT_ID);
    });
    jest.mocked(Navigation.revealRouteBeforeDismissingModal).mockImplementation((_route: unknown, options?: {afterTransition?: () => void}) => {
        options?.afterTransition?.();
    });
    jest.mocked(Navigation.dismissModal).mockImplementation((options?: {afterTransition?: () => void}) => {
        options?.afterTransition?.();
    });
}

describe('SubmitDetailsPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        const actualGetReportOrDraftReport = jest.requireActual<ReportUtilsActual>('@libs/ReportUtils').getReportOrDraftReport;
        jest.mocked(getReportOrDraftReport).mockImplementation(actualGetReportOrDraftReport);
        resetNavigationMocksForSubmitDetailsPageTests();
        await Onyx.clear();
        await waitForBatchedUpdates();
        await seedShareState();
    });

    // Error #1 — requestMoney and cleanupAndNavigateAfterExpenseCreate must share one optimisticTransactionID
    // (not the draft placeholder), or post-submit navigation can miss the created expense.
    it('threads the same optimisticTransactionID into requestMoney AND cleanupAndNavigateAfterExpenseCreate (V8 contract)', async () => {
        await renderAndConfirm();

        // A regular chat (not self-DM) routes to requestMoney.
        const requestMoneyArg = jest.mocked(TrackExpense.requestMoney).mock.calls.at(0)?.[0];
        const cleanupArg = jest.mocked(cleanupAndNavigateAfterExpenseCreate).mock.calls.at(0)?.[0];

        expect(requestMoneyArg).toBeDefined();
        expect(cleanupArg).toBeDefined();

        expect(typeof requestMoneyArg?.optimisticTransactionID).toBe('string');
        expect(requestMoneyArg?.optimisticTransactionID).not.toBe(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
        expect(cleanupArg?.transactionID).toBe(requestMoneyArg?.optimisticTransactionID);
    });

    // Error #2 — share receipts must carry a trace id and log captured/submitted milestones so receipt
    // upload issues can be correlated end-to-end in production logs.
    it('stamps the shared receipt with a trace id and logs the capture and submit milestones with source share', async () => {
        const logInfoSpy = jest.spyOn(Log, 'info').mockImplementation(() => {});

        await renderAndConfirm();

        // The trace id minted at capture travels into the request receipt, so the enqueued and snapshot logs can join back to the capture log.
        const requestMoneyArg = jest.mocked(TrackExpense.requestMoney).mock.calls.at(0)?.[0];
        const receiptTraceId = requestMoneyArg?.transactionParams?.receipt?.receiptTraceId;
        expect(typeof receiptTraceId).toBe('string');
        expect(receiptTraceId).toBeTruthy();

        // Each [Receipt] milestone carries its `event` in the params (Log.info's 3rd arg), so find by event.
        const receiptMilestone = (event: string) =>
            logInfoSpy.mock.calls.map((call) => call[2]).find((params) => typeof params === 'object' && params !== null && 'event' in params && params.event === event);

        // The capture milestone fires for the share entry point.
        expect(receiptMilestone('captured')).toMatchObject({captureSource: 'share', receiptTraceId});

        // The submit milestone maps the fixed draft id to the final transaction id.
        expect(receiptMilestone('submitted')).toMatchObject({
            receiptTraceId,
            draftTransactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
            transactionID: requestMoneyArg?.optimisticTransactionID,
        });

        logInfoSpy.mockRestore();
    });

    // Error #3 — HEIC shares must upload the converted JPEG from VALIDATED_FILE_OBJECT, not the raw .heic
    // the backend rejects.
    it('uploads the converted JPEG (not the raw HEIC) when the shared file needed validation', async () => {
        // A HEIC share: SHARE_TEMP_FILE holds the raw .heic file, VALIDATED_FILE_OBJECT holds the converted JPEG.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SHARE_TEMP_FILE, {content: 'file://shared.heic', mimeType: CONST.SHARE_FILE_MIMETYPE.HEIC});
            await Onyx.merge(ONYXKEYS.VALIDATED_FILE_OBJECT, {uri: 'file://converted.jpg', type: CONST.RECEIPT_ALLOWED_FILE_TYPES.JPEG});
        });

        await renderAndConfirm();

        // The upload must read the converted JPEG, never the raw .heic the backend rejects.
        const readFileArg = jest.mocked(readFileAsync).mock.calls.at(0);
        expect(readFileArg?.[0]).toBe('file://converted.jpg');
        expect(readFileArg?.[4]).toBe(CONST.RECEIPT_ALLOWED_FILE_TYPES.JPEG);
    });

    // Error #4 — confirm must wait for HEIC→JPEG conversion; a fast tap must not upload raw HEIC early.
    it('does not upload while a share that needs validation is still awaiting its converted file', async () => {
        // A HEIC share whose conversion has not landed yet: VALIDATED_FILE_OBJECT is empty.
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SHARE_TEMP_FILE, {content: 'file://shared.heic', mimeType: CONST.SHARE_FILE_MIMETYPE.HEIC});
            await Onyx.set(ONYXKEYS.VALIDATED_FILE_OBJECT, undefined);
        });

        await renderAndConfirm();

        // Confirm must bail out (no raw HEIC uploaded) until the converted file is ready.
        expect(jest.mocked(readFileAsync)).not.toHaveBeenCalled();
    });

    // Error #12 — the share extension wipes its folder on the next share, so the read must come from the receipts folder.
    it('adopts the shared file into the receipts folder and uploads from there', async () => {
        // Given a share whose file adopt moves into the receipts folder
        const durableUri = 'file:///Documents/Receipts-Upload/shared_1234.jpg';
        jest.mocked(ReceiptStorage.adopt).mockResolvedValueOnce('shared_1234.jpg');
        jest.mocked(ReceiptStorage.toLocalUri).mockReturnValueOnce(durableUri);

        // When the user confirms the submit
        await renderAndConfirm();

        // Then the upload reads the durable copy, never the app-group path
        expect(ReceiptStorage.adopt).toHaveBeenCalledWith('file://shared.jpg', expect.any(String));
        expect(jest.mocked(readFileAsync).mock.calls.at(0)?.[0]).toBe(durableUri);
    });

    // Error #12b — a failed move must not block the submit: the shared path still works for this session.
    it('submits with the shared path when adopting the file fails', async () => {
        // Given adopt rejects
        const logAlertSpy = jest.spyOn(Log, 'alert').mockImplementation(() => {});
        jest.mocked(ReceiptStorage.adopt).mockRejectedValueOnce(new Error('move failed'));

        // When the user confirms the submit
        await renderAndConfirm();

        // Then the upload falls back to the shared path, logs the failure, and the expense is still created
        expect(jest.mocked(readFileAsync).mock.calls.at(0)?.[0]).toBe('file://shared.jpg');
        expect(logAlertSpy).toHaveBeenCalledWith(expect.stringContaining('adopt failed'), expect.objectContaining({captureSource: 'share'}));
        expect(TrackExpense.requestMoney).toHaveBeenCalled();

        logAlertSpy.mockRestore();
    });

    // Error #12c — adopt is a move, so a retry after a read failure has to work off the durable copy.
    it('retries from the durable copy after a file-read failure', async () => {
        // Given a share that adopts fine but fails its first read
        const durableUri = 'file:///Documents/Receipts-Upload/shared_1234.jpg';
        jest.mocked(ReceiptStorage.adopt).mockResolvedValueOnce('shared_1234.jpg');
        jest.mocked(ReceiptStorage.toLocalUri).mockReturnValueOnce(durableUri);
        jest.mocked(readFileAsync).mockImplementationOnce((_path, _fileName, _onSuccess, onFailure) => {
            onFailure?.('[FileUtils] Could not read uploaded file');
            return Promise.resolve();
        });

        // When the user confirms, the read fails, and the user confirms again
        await renderAndConfirm();
        fireEvent.press(screen.getByTestId('mock-confirm-button'));
        await waitForBatchedUpdatesWithAct();

        // Then the second attempt works off the durable copy, not the shared path the move emptied
        expect(jest.mocked(readFileAsync).mock.calls.at(0)?.[0]).toBe(durableUri);
        expect(jest.mocked(ReceiptStorage.adopt).mock.calls.at(1)?.[0]).toBe(durableUri);
        expect(jest.mocked(readFileAsync).mock.calls.at(1)?.[0]).toBe(durableUri);
        expect(TrackExpense.requestMoney).toHaveBeenCalled();
    });

    // Error #5 — wide layout fallback: when destination is not topmost, reveal it via revealRouteBeforeDismissingModal
    // and defer navigation to cleanup (shouldNavigate: false) so we do not double-navigate after dismiss.
    it('wide layout: reveals destination via revealRouteBeforeDismissingModal when another report is topmost', async () => {
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue(undefined);
        jest.mocked(getIsNarrowLayout).mockReturnValue(false);

        await renderAndConfirm();

        expect(Navigation.revealRouteBeforeDismissingModal).toHaveBeenCalledWith(
            ROUTES.REPORT_WITH_ID.getRoute(SHARED_REPORT_ID),
            expect.objectContaining({afterTransition: expect.any(Function)}),
        );
        expect(jest.mocked(cleanupAndNavigateAfterExpenseCreate).mock.calls.at(0)?.[0]?.shouldNavigate).toBe(false);
        expect(TrackExpense.requestMoney).toHaveBeenCalled();
    });

    // Error #5b — narrow layout headline: pre-insert destination, then submit resolves via dismissModal.
    it('narrow layout: pre-inserts destination and dismisses modal when another report is topmost', async () => {
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue(undefined);

        await renderAndConfirm();

        expect(Navigation.preInsertFullscreenUnderRHP).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(SHARED_REPORT_ID));
        expect(Navigation.dismissModal).toHaveBeenCalledWith(expect.objectContaining({afterTransition: expect.any(Function)}));
        expect(jest.mocked(cleanupAndNavigateAfterExpenseCreate).mock.calls.at(0)?.[0]?.shouldNavigate).toBe(false);
        expect(TrackExpense.requestMoney).toHaveBeenCalled();
    });

    // Error #6 — when the destination chat is already topmost, submit should skip pre-mount reveal and let
    // cleanupAndNavigateAfterExpenseCreate handle navigation.
    it('skips pre-mount reveal and passes shouldNavigate true to cleanup when the destination report is already topmost', async () => {
        await renderAndConfirm();

        expect(Navigation.revealRouteBeforeDismissingModal).not.toHaveBeenCalled();
        expect(jest.mocked(cleanupAndNavigateAfterExpenseCreate).mock.calls.at(0)?.[0]?.shouldNavigate).toBe(true);
        expect(TrackExpense.requestMoney).toHaveBeenCalled();
    });

    // Error #7 — pre-mount only runs when the destination report exists in COLLECTION.REPORT (not draft-only),
    // otherwise reveal would mount an empty screen behind the share modal.
    it('does not pre-mount when the destination report is missing from COLLECTION.REPORT', async () => {
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue(undefined);
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${SHARED_REPORT_ID}`, null);
        });

        await renderAndConfirm();

        expect(Navigation.preInsertFullscreenUnderRHP).not.toHaveBeenCalled();
        expect(Navigation.revealRouteBeforeDismissingModal).not.toHaveBeenCalled();
        expect(jest.mocked(cleanupAndNavigateAfterExpenseCreate).mock.calls.at(0)?.[0]?.shouldNavigate).toBe(false);
    });

    // Error #7b — after a missing-destination submit, the optimistic report landing must not arm
    // usePreMountDestination (narrow pre-insert) alongside the pending reveal — that dual-nav race
    // leaves a stale pre-insert flag under the RHP.
    it('does not arm pre-mount after the optimistic destination lands on the pending-navigation path', async () => {
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue(undefined);
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${SHARED_REPORT_ID}`, null);
        });

        await renderAndConfirm();

        expect(Navigation.preInsertFullscreenUnderRHP).not.toHaveBeenCalled();
        expect(jest.mocked(cleanupAndNavigateAfterExpenseCreate).mock.calls.at(0)?.[0]?.shouldNavigate).toBe(false);

        // Simulate the expense create writing the destination into COLLECTION.REPORT (requestMoney is mocked).
        const landedReport = createTestReport();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${SHARED_REPORT_ID}`, landedReport);
        });
        await waitForBatchedUpdatesWithAct();

        expect(Navigation.preInsertFullscreenUnderRHP).not.toHaveBeenCalled();
        expect(Navigation.revealRouteBeforeDismissingModal).toHaveBeenCalledTimes(1);
        expect(Navigation.revealRouteBeforeDismissingModal).toHaveBeenCalledWith(
            ROUTES.REPORT_WITH_ID.getRoute(SHARED_REPORT_ID),
            expect.objectContaining({afterTransition: expect.any(Function)}),
        );
    });

    // Error #8 — backing out before submit must tear down any pre-inserted destination route before goBack,
    // or the stale route can flash behind the next modal dismiss.
    it('cleans up a pre-inserted destination route before goBack when the user backs out without submitting', async () => {
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue(undefined);

        renderSubmitDetailsPage();
        await waitForBatchedUpdatesWithAct();

        expect(Navigation.preInsertFullscreenUnderRHP).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(SHARED_REPORT_ID));

        fireEvent.press(screen.getByTestId('mock-back-button'));
        await waitForBatchedUpdatesWithAct();

        expect(Navigation.removePreInsertedFullscreenIfNeeded).toHaveBeenCalled();
        expect(Navigation.goBack).toHaveBeenCalled();
    });

    // Error #9 — unmounting between formHasBeenSubmitted and reveal() must not crash or leak stale callbacks.
    it('handles unmount between submit and reveal without crashing', async () => {
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue(undefined);

        let pendingRevealCallback: (() => void) | undefined;
        jest.mocked(Navigation.revealRouteBeforeDismissingModal).mockImplementation((_route: unknown, options?: {afterTransition?: () => void}) => {
            // Simulate reveal being async—store callback but don't call it yet.
            pendingRevealCallback = options?.afterTransition;
        });

        const {unmount} = renderSubmitDetailsPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByTestId('mock-confirm-button'));
        await waitForBatchedUpdatesWithAct();

        // Component unmounts before reveal callback fires.
        unmount();

        // Fire the callback after unmount—should not crash even though component is gone.
        expect(() => pendingRevealCallback?.()).not.toThrow();
    });

    // Error #10 — if optimistic report lands under wrong ID, submit must navigate to intended destination, not stray.
    it('navigates to intended reportID even if optimistic report lands under different ID', async () => {
        jest.useFakeTimers();
        try {
            jest.mocked(Navigation.getTopmostReportId).mockReturnValue(undefined);
            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${SHARED_REPORT_ID}`, null);
            });

            const wrongReportID = 'report-wrong-id';

            await renderAndConfirm();

            // Simulate expense create landing a report under a different ID (e.g., due to conflict or dedupe).
            const wrongReport = createTestReport();
            wrongReport.reportID = wrongReportID;
            jest.mocked(getReportOrDraftReport).mockReturnValue(wrongReport);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${wrongReportID}`, wrongReport);
            });
            await waitForBatchedUpdatesWithAct();

            // Advance timers to trigger the fallback reveal timeout
            jest.advanceTimersByTime(600);
            await waitForBatchedUpdatesWithAct();

            // Should navigate to the ORIGINAL intended report (SHARED_REPORT_ID), not the mismatched one.
            expect(Navigation.revealRouteBeforeDismissingModal).toHaveBeenCalledWith(
                ROUTES.REPORT_WITH_ID.getRoute(SHARED_REPORT_ID),
                expect.objectContaining({afterTransition: expect.any(Function)}),
            );
        } finally {
            jest.useRealTimers();
        }
    });

    // Error #11 — narrow layout race: confirm fires before scheduleWhenIdle runs pre-insert setup.
    // Pre-insert should not happen, but submit must still complete without crashing.
    it('narrow layout: handles confirm before scheduleWhenIdle fires pre-insert setup', async () => {
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue(undefined);

        // scheduleWhenIdle callback never fires — pre-insert setup won't run
        jest.mocked(Scheduler.scheduleWhenIdle).mockImplementation(() => ({cancel: jest.fn()}));

        await renderAndConfirm();

        // Pre-insert should NOT be called since callback never fired
        expect(Navigation.preInsertFullscreenUnderRHP).not.toHaveBeenCalled();

        // Submit should still execute
        expect(TrackExpense.requestMoney).toHaveBeenCalled();

        // Should fall back to reveal path for wide layout or skip nav (shouldNavigate false)
        // depending on how code handles the race — critical is no crash and proper cleanup
        expect(jest.mocked(cleanupAndNavigateAfterExpenseCreate).mock.calls.at(0)?.[0]).toBeDefined();
    });
});
