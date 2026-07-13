/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {act, fireEvent, render, screen} from '@testing-library/react-native';

import SubmitDetailsPage from '@pages/Share/SubmitDetailsPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import type * as FileUtilsModule from '../../src/libs/fileDownload/FileUtils';

import * as TrackExpense from '../../src/libs/actions/IOU/TrackExpense';
import cleanupAndNavigateAfterExpenseCreate from '../../src/libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/actions/IOU/TrackExpense', () => {
    const actual = jest.requireActual<typeof TrackExpense>('@libs/actions/IOU/TrackExpense');
    return {
        ...actual,
        requestMoney: jest.fn(() => ({iouReport: undefined})),
        trackExpense: jest.fn(),
    };
});

jest.mock('@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate', () => jest.fn());

jest.mock('@libs/fileDownload/FileUtils', () => {
    const actual = jest.requireActual<typeof FileUtilsModule>('@libs/fileDownload/FileUtils');
    return {
        ...actual,
        // Fire the success callback synchronously with a minimal File-like object so finishRequestAndNavigate runs.
        readFileAsync: jest.fn((_uri: string, name: string, onSuccess: (file: {name: string; uri: string}) => void) => {
            onSuccess({name, uri: 'file://test-receipt.jpg'});
        }),
    };
});

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

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getReportRouteByID: jest.fn(() => undefined),
    removeScreenByKey: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((cb: () => void) => cb()),
    dismissModalWithReport: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    getActiveRoute: jest.fn(() => ''),
    navigationRef: {getCurrentRoute: jest.fn(() => undefined), getState: jest.fn(() => ({}))},
}));

jest.mock('@pages/Share/ShareRootPage', () => ({showErrorAlert: jest.fn()}));

jest.mock('@pages/Share/useShareFileSizeValidation', () => jest.fn());

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

describe('SubmitDetailsPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('threads the same optimisticTransactionID into requestMoney AND cleanupAndNavigateAfterExpenseCreate (V8 contract)', async () => {
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

        render(
            <SubmitDetailsPage
                // @ts-expect-error minimal route for test
                route={{key: 'submit-test', name: 'Share_Submit_Details', params: {reportOrAccountID: SHARED_REPORT_ID}}}
                navigation={{} as never}
            />,
        );

        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByTestId('mock-confirm-button'));
        await waitForBatchedUpdatesWithAct();

        // A regular chat (not self-DM) routes to requestMoney.
        const requestMoneyArg = jest.mocked(TrackExpense.requestMoney).mock.calls.at(0)?.[0];
        const cleanupArg = jest.mocked(cleanupAndNavigateAfterExpenseCreate).mock.calls.at(0)?.[0];

        expect(requestMoneyArg).toBeDefined();
        expect(cleanupArg).toBeDefined();

        expect(typeof requestMoneyArg?.optimisticTransactionID).toBe('string');
        expect(requestMoneyArg?.optimisticTransactionID).not.toBe(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
        expect(cleanupArg?.transactionID).toBe(requestMoneyArg?.optimisticTransactionID);
    });
});
