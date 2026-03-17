import {act, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import type {ReportActionsCollectionDataSet} from '@src/types/onyx/ReportAction';
import type {ReportNameValuePairsCollectionDataSet} from '@src/types/onyx/ReportNameValuePairs';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

// Be sure to include the mocked Permissions and Expensicons libraries or else the beta tests won't work
jest.mock('@src/libs/Permissions');
jest.mock('@src/components/Icon/Expensicons');
jest.mock('@src/hooks/useRootNavigationState');

const TEST_USER_ACCOUNT_ID = 1;
const TEST_USER_LOGIN = 'email1@test.com';

describe('Sidebar', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });

        initOnyxDerivedValues();
    });

    beforeEach(async () => {
        // Wrap Onyx each onyx action with waitForBatchedUpdates
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        await act(async () => {
            await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
            // Initialize the network key for OfflineWithFeedback
            await TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
            await Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
        });

        await waitForBatchedUpdatesWithAct();
    });

    // Clear out Onyx after each test so that each test starts with a clean slate
    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });

        await waitForBatchedUpdatesWithAct();
    });

    describe('archived chats', () => {
        it('renders the archive reason as the preview message of the chat', () => {
            const report = {
                ...LHNTestUtils.getFakeReport([1, 2], 3, true),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                lastMessageText: 'test',
            };

            const action = {
                ...LHNTestUtils.getFakeReportAction('email1@test.com', 3),
                actionName: 'CLOSED',
                originalMessage: {
                    reason: CONST.REPORT.ARCHIVE_REASON.DEFAULT,
                },
            };

            const reportNameValuePairs = {
                private_isArchived: DateUtils.getDBTime(),
            };

            // Given the user is in all betas
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            return (
                waitForBatchedUpdatesWithAct()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks('0'))
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() => {
                        const reportCollection: ReportCollectionDataSet = {
                            [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                        };

                        const reportAction: ReportActionsCollectionDataSet = {
                            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`]: {[action.reportActionID]: action},
                        } as ReportActionsCollectionDataSet;

                        const reportNameValuePairsCollection: ReportNameValuePairsCollectionDataSet = {
                            [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`]: reportNameValuePairs,
                        };

                        return act(async () => {
                            await Onyx.multiSet({
                                [ONYXKEYS.BETAS]: betas,
                                [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                                [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                                [ONYXKEYS.IS_LOADING_APP]: false,
                                ...reportNameValuePairsCollection,
                                ...reportCollection,
                                ...reportAction,
                            });
                        });
                    })
                    .then(() => {
                        const hintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames.at(0)).toHaveTextContent('Report (archived)');
                        const hintMessagePreviewText = TestHelper.translateLocal('accessibilityHints.lastChatMessagePreview');
                        const messagePreviewTexts = screen.queryAllByLabelText(hintMessagePreviewText);
                        expect(messagePreviewTexts.at(0)).toHaveTextContent('This chat room has been archived.');
                    })
            );
        });
        it('renders the policy deleted archive reason as the preview message of the chat', () => {
            const report = {
                ...LHNTestUtils.getFakeReport([1, 2], 3, true),
                policyName: 'Vikings Policy',
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                private_isArchived: DateUtils.getDBTime(),
                lastMessageText: 'test',
            };
            const action = {
                ...LHNTestUtils.getFakeReportAction('email1@test.com', 3),
                actionName: 'CLOSED',
                originalMessage: {
                    policyName: 'Vikings Policy',
                    reason: 'policyDeleted',
                },
            };
            const reportNameValuePairs = {
                private_isArchived: DateUtils.getDBTime(),
            };

            // Given the user is in all betas
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            return (
                waitForBatchedUpdatesWithAct()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks('0'))
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() => {
                        const reportCollection: ReportCollectionDataSet = {
                            [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                        };

                        const reportAction: ReportActionsCollectionDataSet = {
                            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`]: {[action.reportActionID]: action},
                        } as ReportActionsCollectionDataSet;

                        const reportNameValuePairsCollection: ReportNameValuePairsCollectionDataSet = {
                            [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`]: reportNameValuePairs,
                        };

                        return act(async () => {
                            await Onyx.multiSet({
                                [ONYXKEYS.BETAS]: betas,
                                [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                                [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                                [ONYXKEYS.IS_LOADING_APP]: false,
                                ...reportNameValuePairsCollection,
                                ...reportCollection,
                                ...reportAction,
                            });
                        });
                    })
                    .then(() => {
                        const hintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames.at(0)).toHaveTextContent('Report (archived)');
                        const hintMessagePreviewText = TestHelper.translateLocal('accessibilityHints.lastChatMessagePreview');
                        const messagePreviewTexts = screen.queryAllByLabelText(hintMessagePreviewText);
                        expect(messagePreviewTexts.at(0)).toHaveTextContent('This chat is no longer active because Vikings Policy is no longer an active workspace.');
                    })
            );
        });
    });
});
