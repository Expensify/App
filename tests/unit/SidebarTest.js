import Onyx from 'react-native-onyx';
import {cleanup, screen} from '@testing-library/react-native';
import lodashGet from 'lodash/get';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import wrapOnyxWithWaitForPromisesToResolve from '../utils/wrapOnyxWithWaitForPromisesToResolve';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import CONST from '../../src/CONST';
import * as Localize from '../../src/libs/Localize';

// Be sure to include the mocked Permissions and Expensicons libraries or else the beta tests won't work
jest.mock('../../src/libs/Permissions');
jest.mock('../../src/components/Icon/Expensicons');

const ONYXKEYS = {
    PERSONAL_DETAILS_LIST: 'personalDetailsList',
    NVP_PRIORITY_MODE: 'nvp_priorityMode',
    SESSION: 'session',
    BETAS: 'betas',
    COLLECTION: {
        REPORT: 'report_',
        REPORT_ACTIONS: 'reportActions_',
    },
    NETWORK: 'network',
};

describe('Sidebar', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            registerStorageEventListener: () => {},
        }),
    );

    beforeEach(() => {
        // Wrap Onyx each onyx action with waitForPromiseToResolve
        wrapOnyxWithWaitForPromisesToResolve(Onyx);
        // Initialize the network key for OfflineWithFeedback
        return Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
    });

    // Clear out Onyx after each test so that each test starts with a clean slate
    afterEach(() => {
        cleanup();
        Onyx.clear();
    });

    describe('archived chats', () => {
        it('renders the archive reason as the preview message of the chat', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com'], 3, true),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                statusNum: CONST.REPORT.STATUS.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            };

            // Given the user is in all betas
            const betas = [CONST.BETAS.DEFAULT_ROOMS, CONST.BETAS.POLICY_ROOMS, CONST.BETAS.POLICY_EXPENSE_CHAT];
            LHNTestUtils.getDefaultRenderedSidebarLinks('0');
            return (
                waitForPromisesToResolve()
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.BETAS]: betas,
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                        }),
                    )
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Report (archived)');

                        const hintMessagePreviewText = Localize.translateLocal('accessibilityHints.lastChatMessagePreview');
                        const messagePreviewTexts = screen.queryAllByLabelText(hintMessagePreviewText);
                        expect(lodashGet(messagePreviewTexts, [0, 'props', 'children'])).toBe('This chat room has been archived.');
                    })
            );
        });
        it('renders the policy deleted archive reason as the preview message of the chat', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com'], 3, true),
                policyName: 'Vikings Policy',
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                statusNum: CONST.REPORT.STATUS.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            };
            const action = {
                ...LHNTestUtils.getFakeReportAction('email1@test.com', 3, true),
                actionName: 'CLOSED',
                originalMessage: {
                    policyName: 'Vikings Policy',
                    reason: 'policyDeleted',
                },
            };

            // Given the user is in all betas
            const betas = [CONST.BETAS.DEFAULT_ROOMS, CONST.BETAS.POLICY_ROOMS, CONST.BETAS.POLICY_EXPENSE_CHAT];
            LHNTestUtils.getDefaultRenderedSidebarLinks('0');
            return (
                waitForPromisesToResolve()
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.BETAS]: betas,
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`]: {[action.reportActionId]: action},
                        }),
                    )
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Report (archived)');

                        const hintMessagePreviewText = Localize.translateLocal('accessibilityHints.lastChatMessagePreview');
                        const messagePreviewTexts = screen.queryAllByLabelText(hintMessagePreviewText);
                        expect(lodashGet(messagePreviewTexts, [0, 'props', 'children'])).toBe(
                            'This workspace chat is no longer active because Vikings Policy is no longer an active workspace.',
                        );
                    })
            );
        });
    });
});
