import {screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import * as Localize from '@src/libs/Localize';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import type {ReportActionsCollectionDataSet} from '@src/types/onyx/ReportAction';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

// Be sure to include the mocked Permissions and Expensicons libraries as well as the usePermissions hook or else the beta tests won't work
jest.mock('@src/libs/Permissions');
jest.mock('@src/hooks/usePermissions.ts');
jest.mock('@src/hooks/useActiveWorkspaceFromNavigationState');
jest.mock('@src/components/Icon/Expensicons');

describe('Sidebar', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
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

    describe('archived chats', () => {
        it('renders the archive reason as the preview message of the chat', () => {
            const report = {
                ...LHNTestUtils.getFakeReport([1, 2], 3, true),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                lastMessageText: 'test',
            };

            const action = {
                ...LHNTestUtils.getFakeReportAction('email1@test.com', 3),
                actionName: 'CLOSED',
                originalMessage: {
                    reason: CONST.REPORT.ARCHIVE_REASON.DEFAULT,
                },
            };

            // Given the user is in all betas
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            LHNTestUtils.getDefaultRenderedSidebarLinks('0');
            return (
                waitForBatchedUpdates()
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() => {
                        const reportCollection: ReportCollectionDataSet = {
                            [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                        };

                        const reportAction: ReportActionsCollectionDataSet = {
                            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`]: {[action.reportActionID]: action},
                        } as ReportActionsCollectionDataSet;

                        return Onyx.multiSet({
                            [ONYXKEYS.BETAS]: betas,
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            ...reportCollection,
                            ...reportAction,
                        });
                    })
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames[0]).toHaveTextContent('Report (archived)');

                        const hintMessagePreviewText = Localize.translateLocal('accessibilityHints.lastChatMessagePreview');
                        const messagePreviewTexts = screen.queryAllByLabelText(hintMessagePreviewText);
                        expect(messagePreviewTexts[0]).toHaveTextContent('This chat room has been archived.');
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

            // Given the user is in all betas
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            LHNTestUtils.getDefaultRenderedSidebarLinks('0');
            return (
                waitForBatchedUpdates()
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() => {
                        const reportCollection: ReportCollectionDataSet = {
                            [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                        };

                        const reportAction: ReportActionsCollectionDataSet = {
                            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`]: {[action.reportActionID]: action},
                        } as ReportActionsCollectionDataSet;

                        return Onyx.multiSet({
                            [ONYXKEYS.BETAS]: betas,
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            ...reportCollection,
                            ...reportAction,
                        });
                    })
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames[0]).toHaveTextContent('Report (archived)');

                        const hintMessagePreviewText = Localize.translateLocal('accessibilityHints.lastChatMessagePreview');
                        const messagePreviewTexts = screen.queryAllByLabelText(hintMessagePreviewText);
                        expect(messagePreviewTexts[0]).toHaveTextContent('This chat is no longer active because Vikings Policy is no longer an active workspace.');
                    })
            );
        });
    });
});
