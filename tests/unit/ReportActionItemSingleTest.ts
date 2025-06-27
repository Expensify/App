import {renderHook, screen, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DO_NOT_USE__EXPORT_FOR_TESTS__useIDOfReportPreviewSender as useIDOfReportPreviewSender} from '@src/pages/home/report/ReportActionItemSingle';
import type {PersonalDetailsList} from '@src/types/onyx';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import {actionR14932, actionR98765} from '../../__mocks__/reportData/actions';
import {chatReportR14932, iouReportR14932} from '../../__mocks__/reportData/reports';
import {transactionR14932} from '../../__mocks__/reportData/transactions';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

describe('ReportActionItemSingle', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        }),
    );

    beforeEach(() => {
        // Wrap Onyx each onyx action with waitForBatchedUpdates
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        // Initialize the network key for OfflineWithFeedback
        return Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
    });

    // Clear out Onyx after each test so that each test starts with a clean slate
    afterEach(() => {
        Onyx.clear();
    });

    describe('when the Report is a policy expense chat', () => {
        describe('and the property "shouldShowSubscriptAvatar" is true', () => {
            const shouldShowSubscriptAvatar = true;
            const fakeReport = LHNTestUtils.getFakeReportWithPolicy([1, 2]);
            const fakeReportAction = LHNTestUtils.getFakeAdvancedReportAction();
            const fakePolicy = LHNTestUtils.getFakePolicy(fakeReport.policyID);
            const faceAccountId = fakeReportAction.actorAccountID ?? CONST.DEFAULT_NUMBER_ID;
            const fakePersonalDetails: PersonalDetailsList = {
                [faceAccountId]: {
                    accountID: faceAccountId,
                    login: 'email1@test.com',
                    displayName: 'Email One',
                    avatar: 'https://example.com/avatar.png',
                    firstName: 'One',
                },
            };

            function setup() {
                const policyCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [fakePolicy], (item) => item.id);
                return waitForBatchedUpdates()
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_REPORT_DATA]: false,
                            ...policyCollectionDataSet,
                        }),
                    )
                    .then(() => {
                        LHNTestUtils.getDefaultRenderedReportActionItemSingle(shouldShowSubscriptAvatar, fakeReport, fakeReportAction);
                    });
            }

            it('renders secondary Avatar properly', async () => {
                const expectedSecondaryIconTestId = 'SvgDefaultAvatar_w Icon';

                await setup();
                await waitFor(() => {
                    expect(screen.getByTestId(expectedSecondaryIconTestId)).toBeOnTheScreen();
                });
            });

            it('renders Person information', async () => {
                const [expectedPerson] = fakeReportAction.person ?? [];

                await setup();
                await waitFor(() => {
                    expect(screen.getByText(expectedPerson.text ?? '')).toBeOnTheScreen();
                });
            });
        });
    });
});

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

describe('useIDOfReportPreviewSender', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
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

    it('returns undefined when action is not a report preview', () => {
        const {result} = renderHook(() =>
            useIDOfReportPreviewSender({
                action: actionR14932,
                iouReport: iouReportR14932,
            }),
        );
        expect(result.current).toBeUndefined();
    });

    it('returns childManagerAccountID when all conditions are met for Send Money flow', async () => {
        const {result} = renderHook(() =>
            useIDOfReportPreviewSender({
                action: {...validAction, childMoneyRequestCount: 0},
                iouReport: iouReportR14932,
            }),
        );
        expect(result.current).toBe(iouReportR14932.managerID);
    });

    it('returns undefined when there are multiple attendees', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionR14932.transactionID}`, {
            ...transactionR14932,
            comment: {
                attendees: [{email: 'test@test.com', displayName: 'Test One', avatarUrl: 'https://none.com/none'}],
            },
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionR14932.transactionID}2`, {
            ...transactionR14932,
            comment: {
                attendees: [{email: 'test2@test.com', displayName: 'Test Two', avatarUrl: 'https://none.com/none2'}],
            },
        });
        const {result} = renderHook(() =>
            useIDOfReportPreviewSender({
                action: validAction,
                iouReport: iouReportR14932,
            }),
        );
        expect(result.current).toBeUndefined();
    });

    it('returns undefined when amounts have different signs', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionR14932.transactionID}`, {
            ...transactionR14932,
            amount: 100,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionR14932.transactionID}2`, {
            ...transactionR14932,
            amount: -100,
        });
        const {result} = renderHook(() =>
            useIDOfReportPreviewSender({
                action: validAction,
                iouReport: iouReportR14932,
            }),
        );
        expect(result.current).toBeUndefined();
    });

    it('returns childOwnerAccountID when all conditions are met', () => {
        const {result} = renderHook(() =>
            useIDOfReportPreviewSender({
                action: validAction,
                iouReport: iouReportR14932,
            }),
        );
        expect(result.current).toBe(iouReportR14932.ownerAccountID);
    });
});
