import {act, renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useReportPreviewSenderID from '@components/ReportActionAvatars/useReportPreviewSenderID';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import CONST from '@src/CONST';
import * as PersonalDetailsUtils from '@src/libs/PersonalDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import {actionR14932, actionR98765} from '../../__mocks__/reportData/actions';
import personalDetails from '../../__mocks__/reportData/personalDetails';
import {chatReportR14932, iouReportR14932} from '../../__mocks__/reportData/reports';
import {transactionR14932} from '../../__mocks__/reportData/transactions';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

import PropertyKeysOf = jest.PropertyKeysOf;

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

describe('useReportPreviewSenderID', () => {
    const mockedDMChatRoom = {...chatReportR14932, chatType: undefined};

    const mockedEmailToID: Record<string, PropertyKeysOf<typeof personalDetails>> = {
        [personalDetails[15593135].login]: 15593135,
        [personalDetails[51760358].login]: 51760358,
    };

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        initOnyxDerivedValues();
        jest.spyOn(PersonalDetailsUtils, 'getPersonalDetailByEmail').mockImplementation((email) => personalDetails[mockedEmailToID[email]]);
    });

    beforeEach(() => {
        return act(async () => {
            await Onyx.multiSet({
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
            {wrapper: OnyxListItemProvider},
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
            {wrapper: OnyxListItemProvider},
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
            {wrapper: OnyxListItemProvider},
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
            {wrapper: OnyxListItemProvider},
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
            {wrapper: OnyxListItemProvider},
        );
        await waitForBatchedUpdatesWithAct();
        expect(result.current).toBe(iouReportR14932.ownerAccountID);
    });
});
