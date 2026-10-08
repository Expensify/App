import {act, renderHook} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import PersonalDetailsByLoginProvider from '@components/PersonalDetailsByLoginProvider';
import useReportPreviewSenderID from '@components/ReportActionAvatars/useReportPreviewSenderID';

import initOnyxDerivedValues from '@libs/actions/OnyxDerived';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';

import React from 'react';
import Onyx from 'react-native-onyx';

import {actionR14932, actionR98765} from '../../__mocks__/reportData/actions';
import personalDetails from '../../__mocks__/reportData/personalDetails';
import {chatReportR14932, iouReportR14932} from '../../__mocks__/reportData/reports';
import {transactionR14932} from '../../__mocks__/reportData/transactions';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const reportActions = [{[actionR14932.reportActionID]: actionR14932}];
const transactions = [transactionR14932];

const transactionCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.TRANSACTION, transactions, (transaction) => transaction.transactionID);
const reportActionCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.REPORT_ACTIONS, reportActions, (actions) => Object.values(actions).at(0)?.childReportID);

const validAction = {
    ...actionR98765,
    childReportID: iouReportR14932.reportID,
    actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
    childOwnerAccountID: iouReportR14932.ownerAccountID,
    childManagerAccountID: iouReportR14932.managerID,
};

const optimisticAction = {
    ...actionR98765,
    childReportID: iouReportR14932.reportID,
    actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
    childOwnerAccountID: iouReportR14932.ownerAccountID,
    childManagerAccountID: iouReportR14932.managerID,
    isOptimisticAction: true,
};
const CURRENT_USER_EMAIL = 'test@example.com';
const CURRENT_USER_ACCOUNT_ID = 1;
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        email: CURRENT_USER_EMAIL,
        accountID: CURRENT_USER_ACCOUNT_ID,
    })),
}));

function wrapper({children}: {children: React.ReactNode}) {
    return <ComposeProviders components={[OnyxListItemProvider, PersonalDetailsByLoginProvider]}>{children}</ComposeProviders>;
}

describe('useReportPreviewSenderID', () => {
    const mockedDMChatRoom = {...chatReportR14932, chatType: undefined};

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: {accountID: CURRENT_USER_ACCOUNT_ID, email: CURRENT_USER_EMAIL},
            },
        });

        initOnyxDerivedValues();
    });

    beforeEach(() => {
        return act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
                ...reportActionCollectionDataSet,
                ...transactionCollectionDataSet,
            });
            await waitForBatchedUpdatesWithAct();
        });
    });

    afterEach(() => {
        return act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('returns avatar with no reportPreviewSenderID when action is not a report preview', async () => {
        const {result} = renderHook(
            () =>
                useReportPreviewSenderID({
                    action: actionR14932,
                    iouReport: iouReportR14932,
                    chatReport: mockedDMChatRoom,
                }),
            {wrapper},
        );
        await waitForBatchedUpdatesWithAct();
        expect(result.current).toBeUndefined();
    });

    it('returns childManagerAccountID and his avatar when all conditions are met for Send Money flow', async () => {
        const {result} = renderHook(
            () =>
                useReportPreviewSenderID({
                    action: {...validAction, childMoneyRequestCount: 0},
                    iouReport: iouReportR14932,
                    chatReport: mockedDMChatRoom,
                }),
            {wrapper},
        );
        await waitForBatchedUpdatesWithAct();
        expect(result.current).toBe(iouReportR14932.managerID);
    });

    it('returns both avatars & no reportPreviewSenderID when there are multiple attendees', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionR14932.transactionID}`, {
                ...transactionR14932,
                comment: {
                    attendees: [{email: personalDetails[15593135].login, displayName: 'Test One', avatarUrl: 'https://none.com/none'}],
                },
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionR14932.transactionID}2`, {
                ...transactionR14932,
                comment: {
                    attendees: [{email: personalDetails[51760358].login, displayName: 'Test Two', avatarUrl: 'https://none.com/none2'}],
                },
            });
        });
        const {result} = renderHook(
            () =>
                useReportPreviewSenderID({
                    action: validAction,
                    iouReport: iouReportR14932,
                    chatReport: mockedDMChatRoom,
                }),
            {wrapper},
        );
        await waitForBatchedUpdatesWithAct();
        expect(result.current).toBeUndefined();
    });

    it('returns both avatars & no reportPreviewSenderID when amounts have different signs', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionR14932.transactionID}`, {
                ...transactionR14932,
                amount: 100,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionR14932.transactionID}2`, {
                ...transactionR14932,
                amount: -100,
            });
        });
        const {result} = renderHook(
            () =>
                useReportPreviewSenderID({
                    action: validAction,
                    iouReport: iouReportR14932,
                    chatReport: mockedDMChatRoom,
                }),
            {wrapper},
        );
        await waitForBatchedUpdatesWithAct();
        expect(result.current).toBeUndefined();
    });

    it('returns childOwnerAccountID as reportPreviewSenderID and a single avatar when all conditions are met', async () => {
        const {result} = renderHook(
            () =>
                useReportPreviewSenderID({
                    action: validAction,
                    iouReport: iouReportR14932,
                    chatReport: mockedDMChatRoom,
                }),
            {wrapper},
        );
        await waitForBatchedUpdatesWithAct();
        expect(result.current).toBe(iouReportR14932.ownerAccountID);
    });

    it('returns currentUserAccountID as reportPreviewSenderID when action is optimistic and iouReport is an IOU report', async () => {
        const MOCK_IOU_REPORT: Report = {
            reportID: '1',
            type: CONST.REPORT.TYPE.IOU,
        };
        const {result} = renderHook(
            () =>
                useReportPreviewSenderID({
                    action: optimisticAction,
                    iouReport: MOCK_IOU_REPORT,
                    chatReport: mockedDMChatRoom,
                }),
            {wrapper},
        );
        await waitForBatchedUpdatesWithAct();
        expect(result.current).toBe(CURRENT_USER_ACCOUNT_ID);
    });
});
