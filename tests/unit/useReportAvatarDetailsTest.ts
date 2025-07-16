import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useReportAvatarDetails from '@hooks/useReportAvatarDetails';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import CONST from '@src/CONST';
import * as PersonalDetailsUtils from '@src/libs/PersonalDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import {actionR14932, actionR98765} from '../../__mocks__/reportData/actions';
import personalDetails from '../../__mocks__/reportData/personalDetails';
import {policy420A} from '../../__mocks__/reportData/policies';
import {chatReportR14932, iouReportR14932} from '../../__mocks__/reportData/reports';
import {transactionR14932} from '../../__mocks__/reportData/transactions';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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

describe('useReportAvatarDetails', () => {
    const mockedOwnerAccountID = 15593135;
    const mockedOwnerAccountAvatar = personalDetails[mockedOwnerAccountID].avatar;

    const mockedManagerAccountID = 51760358;
    const mockedManagerAccountAvatar = personalDetails[mockedManagerAccountID].avatar;
    const mockedDMChatRoom = {...chatReportR14932, chatType: undefined};

    const policiesMock = {
        personalDetails,
        policies: {
            [`${ONYXKEYS.COLLECTION.POLICY}420A`]: policy420A,
        },
        innerPolicies: {
            [`${ONYXKEYS.COLLECTION.POLICY}420A`]: policy420A,
        },
        policy: policy420A,
    };

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
        Onyx.multiSet({
            ...reportActionCollectionDataSet,
            ...transactionCollectionDataSet,
        });
        return waitForBatchedUpdates();
    });

    afterEach(() => {
        Onyx.clear();
        return waitForBatchedUpdates();
    });

    it('returns avatar with no reportPreviewSenderID when action is not a report preview', async () => {
        const {result} = renderHook(
            () =>
                useReportAvatarDetails({
                    action: actionR14932,
                    iouReport: iouReportR14932,
                    report: mockedDMChatRoom,
                    ...policiesMock,
                }),
            {wrapper: OnyxListItemProvider},
        );
        await waitForBatchedUpdates();
        expect(result.current.primaryAvatar.source).toBe(mockedOwnerAccountAvatar);
        expect(result.current.secondaryAvatar.source).toBeFalsy();
        expect(result.current.reportPreviewSenderID).toBeUndefined();
    });

    it('returns childManagerAccountID and his avatar when all conditions are met for Send Money flow', async () => {
        const {result} = renderHook(
            () =>
                useReportAvatarDetails({
                    action: {...validAction, childMoneyRequestCount: 0},
                    iouReport: iouReportR14932,
                    report: mockedDMChatRoom,
                    ...policiesMock,
                }),
            {wrapper: OnyxListItemProvider},
        );
        await waitForBatchedUpdates();
        expect(result.current.primaryAvatar.source).toBe(mockedManagerAccountAvatar);
        expect(result.current.secondaryAvatar.source).toBeFalsy();
        expect(result.current.reportPreviewSenderID).toBe(iouReportR14932.managerID);
    });

    it('returns both avatars & no reportPreviewSenderID when there are multiple attendees', async () => {
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
        const {result} = renderHook(
            () =>
                useReportAvatarDetails({
                    action: validAction,
                    iouReport: iouReportR14932,
                    report: mockedDMChatRoom,
                    ...policiesMock,
                }),
            {wrapper: OnyxListItemProvider},
        );
        await waitForBatchedUpdates();
        expect(result.current.primaryAvatar.source).toBe(mockedManagerAccountAvatar);
        expect(result.current.secondaryAvatar.source).toBe(mockedOwnerAccountAvatar);
        expect(result.current.reportPreviewSenderID).toBeUndefined();
    });

    it('returns both avatars & no reportPreviewSenderID when amounts have different signs', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionR14932.transactionID}`, {
            ...transactionR14932,
            amount: 100,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionR14932.transactionID}2`, {
            ...transactionR14932,
            amount: -100,
        });
        const {result} = renderHook(
            () =>
                useReportAvatarDetails({
                    action: validAction,
                    iouReport: iouReportR14932,
                    report: mockedDMChatRoom,
                    ...policiesMock,
                }),
            {wrapper: OnyxListItemProvider},
        );
        await waitForBatchedUpdates();
        expect(result.current.primaryAvatar.source).toBe(mockedManagerAccountAvatar);
        expect(result.current.secondaryAvatar.source).toBe(mockedOwnerAccountAvatar);
        expect(result.current.reportPreviewSenderID).toBeUndefined();
    });

    it('returns childOwnerAccountID as reportPreviewSenderID and a single avatar when all conditions are met', async () => {
        const {result} = renderHook(
            () =>
                useReportAvatarDetails({
                    action: validAction,
                    iouReport: iouReportR14932,
                    report: mockedDMChatRoom,
                    ...policiesMock,
                }),
            {wrapper: OnyxListItemProvider},
        );
        await waitForBatchedUpdates();
        expect(result.current.primaryAvatar.source).toBe(mockedOwnerAccountAvatar);
        expect(result.current.secondaryAvatar.source).toBeFalsy();
        expect(result.current.reportPreviewSenderID).toBe(iouReportR14932.ownerAccountID);
    });
});
