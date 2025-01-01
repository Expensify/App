import Onyx from 'react-native-onyx';
import {PromotedActions} from '@components/PromotedActionsBar';
import OnyxUpdateManager from '@libs/actions/OnyxUpdateManager';
import getTopmostCentralPaneRoute from '@libs/Navigation/getTopmostCentralPaneRoute';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {ReportAction, Transaction} from '@src/types/onyx';
import createRandomReportAction from '../utils/collections/reportActions';
import createRandomTransaction from '../utils/collections/transaction';
import {getGlobalFetchMock} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/getTopmostCentralPaneRoute', () => jest.fn());

const mockedGetTopmostCentralPaneRoute = getTopmostCentralPaneRoute as jest.MockedFunction<typeof getTopmostCentralPaneRoute>;

OnyxUpdateManager();
describe('PromotedActionsBar', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        global.fetch = getGlobalFetchMock();
        mockedGetTopmostCentralPaneRoute.mockReset();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    describe('hold', () => {
        it('should not optimistically update the search snapshot if the topmost central pane is not search', async () => {
            // Given a held transaction
            const IOUReportID = '1';
            const IOUTransactionID = '2';
            const searchHash = 2;
            const reportAction: ReportAction<'IOU'> = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    amount: 100,
                    currency: 'USD',
                    type: 'create',
                    IOUReportID,
                    IOUTransactionID,
                },
                message: [],
                previousMessage: [],
            };
            const transaction: Transaction = {
                ...createRandomTransaction(Number(IOUTransactionID)),
                comment: {
                    hold: '1',
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${IOUReportID}`, {
                reportID: IOUReportID,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${IOUTransactionID}`, transaction);

            // When the user unheld the transaction not from the search central pane
            PromotedActions.hold({
                isTextHold: false,
                reportAction,
                reportID: '1',
                isDelegateAccessRestricted: false,
                setIsNoDelegateAccessMenuVisible: () => {},
                currentSearchHash: searchHash,
            }).onSelected();

            await waitForBatchedUpdates();

            // Then the search snapshot should not be updated optimistically
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${searchHash}`,
                    callback: (snapshot) => {
                        Onyx.disconnect(connection);
                        expect(snapshot).toBeUndefined();
                        resolve();
                    },
                });
            });
        });

        it('should optimistically update the search snapshot if the topmost central pane is search', async () => {
            // Given a held transaction
            const IOUReportID = '1';
            const IOUTransactionID = '2';
            const searchHash = 2;
            const reportAction: ReportAction<'IOU'> = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    amount: 100,
                    currency: 'USD',
                    type: 'create',
                    IOUReportID,
                    IOUTransactionID,
                },
                message: [],
                previousMessage: [],
            };
            const transaction: Transaction = {
                ...createRandomTransaction(Number(IOUTransactionID)),
                comment: {
                    hold: '1',
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${IOUReportID}`, {
                reportID: IOUReportID,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${IOUTransactionID}`, transaction);

            // When the user unheld the transaction from the search central pane
            mockedGetTopmostCentralPaneRoute.mockReturnValueOnce({name: SCREENS.SEARCH.CENTRAL_PANE});
            PromotedActions.hold({
                isTextHold: false,
                reportAction,
                reportID: '1',
                isDelegateAccessRestricted: false,
                setIsNoDelegateAccessMenuVisible: () => {},
                currentSearchHash: searchHash,
            }).onSelected();

            await waitForBatchedUpdates();

            // Then the search snapshot should be updated optimistically
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${searchHash}`,
                    callback: (snapshot) => {
                        Onyx.disconnect(connection);
                        expect(snapshot).not.toBeUndefined();
                        resolve();
                    },
                });
            });
        });
    });
});
