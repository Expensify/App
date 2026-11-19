import {act, render} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import PopoverReportActionContextMenu from '@pages/inbox/report/ContextMenu/PopoverReportActionContextMenu';
import type {ReportActionContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';

import {dismissRejectUseExplanation} from '@userActions/IOU/RejectMoneyRequest';
import {setNameValuePair} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import React, {createRef} from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const CURRENT_USER_ACCOUNT_ID = 1;
const OTHER_USER_ACCOUNT_ID = 2;

const mockShowHoldSubmitterEducationalModal = jest.fn<Promise<void>, [{isDM?: boolean}?]>(() => Promise.resolve());
const mockShowHoldOrRejectEducationalModal = jest.fn<Promise<void>, []>(() => Promise.resolve());
const mockShouldSuppressPromotionalUI = {value: false};

jest.mock('@components/ActionSheetAwareScrollView', () => ({
    Actions: {CLOSE_POPOVER: 'CLOSE_POPOVER'},
    useActionSheetAwareScrollViewActions: () => ({transitionActionSheetState: jest.fn()}),
}));
jest.mock('@components/PopoverWithMeasuredContent', () => () => null);
jest.mock('@pages/inbox/report/ContextMenu/BaseReportActionContextMenu', () => () => null);
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: CURRENT_USER_ACCOUNT_ID, login: 'user@test.com', email: 'user@test.com'}));
jest.mock('@hooks/useHoldSubmitterEducationalModal', () => () => ({showHoldSubmitterEducationalModal: mockShowHoldSubmitterEducationalModal}));
jest.mock('@hooks/useHoldRejectEducationalModal', () => () => ({showHoldOrRejectEducationalModal: mockShowHoldOrRejectEducationalModal}));
jest.mock('@hooks/useShouldSuppressPromotionalUI', () => () => mockShouldSuppressPromotionalUI.value);
jest.mock('@userActions/IOU/RejectMoneyRequest', () => ({dismissRejectUseExplanation: jest.fn()}));
jest.mock('@userActions/User', () => {
    const actual = jest.requireActual<Record<string, unknown>>('@userActions/User');
    return {...actual, setNameValuePair: jest.fn()};
});

const submitterWorkspaceChat = {
    reportID: '10',
    type: CONST.REPORT.TYPE.CHAT,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
} as Report;

const approverWorkspaceChat = {
    ...submitterWorkspaceChat,
    reportID: '11',
    ownerAccountID: OTHER_USER_ACCOUNT_ID,
} as Report;

const dmChat = {
    reportID: '12',
    type: CONST.REPORT.TYPE.CHAT,
} as Report;

function renderContextMenu() {
    const ref = createRef<ReportActionContextMenu>();
    render(
        <OnyxListItemProvider>
            <PopoverReportActionContextMenu ref={ref} />
        </OnyxListItemProvider>,
    );
    if (!ref.current) {
        throw new Error('Expected the context menu imperative API');
    }
    return ref.current;
}

describe('PopoverReportActionContextMenu hold educational modal', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockShouldSuppressPromotionalUI.value = false;
        await Onyx.clear();
    });

    it('should hold right away when the submitter already dismissed the hold explanation', async () => {
        // Given a submitter who already dismissed the hold explanation
        await Onyx.set(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, true);
        const contextMenu = renderContextMenu();
        await waitForBatchedUpdatesWithAct();
        const performHold = jest.fn();

        // When they hold an expense from the context menu
        act(() => contextMenu.handleHoldEducationalModal(performHold, submitterWorkspaceChat));
        await waitForBatchedUpdatesWithAct();

        // Then the hold runs without any educational modal
        expect(performHold).toHaveBeenCalledTimes(1);
        expect(mockShowHoldSubmitterEducationalModal).not.toHaveBeenCalled();
        expect(mockShowHoldOrRejectEducationalModal).not.toHaveBeenCalled();
    });

    it('should hold right away when promotional UI is suppressed', async () => {
        // Given a supportal or copilot session where promotional UI is suppressed
        mockShouldSuppressPromotionalUI.value = true;
        const contextMenu = renderContextMenu();
        await waitForBatchedUpdatesWithAct();
        const performHold = jest.fn();

        // When an expense is held from the context menu
        act(() => contextMenu.handleHoldEducationalModal(performHold, submitterWorkspaceChat));
        await waitForBatchedUpdatesWithAct();

        // Then the hold runs without any educational modal and without dismissing the explanation for the user
        expect(performHold).toHaveBeenCalledTimes(1);
        expect(mockShowHoldSubmitterEducationalModal).not.toHaveBeenCalled();
        expect(mockShowHoldOrRejectEducationalModal).not.toHaveBeenCalled();
        expect(setNameValuePair).not.toHaveBeenCalled();
    });

    it('should show the hold modal to the submitter and hold once it is dismissed', async () => {
        // Given a submitter who has not seen the hold explanation yet
        const contextMenu = renderContextMenu();
        await waitForBatchedUpdatesWithAct();
        const performHold = jest.fn();

        // When they hold an expense from the context menu and close the modal
        act(() => contextMenu.handleHoldEducationalModal(performHold, submitterWorkspaceChat));
        await waitForBatchedUpdatesWithAct();

        // Then the hold modal is shown with the workspace copy, the explanation is marked as dismissed and the hold runs
        expect(mockShowHoldSubmitterEducationalModal).toHaveBeenCalledWith({isDM: false});
        expect(mockShowHoldOrRejectEducationalModal).not.toHaveBeenCalled();
        expect(setNameValuePair).toHaveBeenCalledWith(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, true, false, true);
        expect(performHold).toHaveBeenCalledTimes(1);
    });

    it('should show the hold modal with the DM copy when holding in a DM', async () => {
        // Given a user who has not seen the hold explanation yet
        const contextMenu = renderContextMenu();
        await waitForBatchedUpdatesWithAct();
        const performHold = jest.fn();

        // When they hold an expense in a DM from the context menu
        act(() => contextMenu.handleHoldEducationalModal(performHold, dmChat));
        await waitForBatchedUpdatesWithAct();

        // Then the hold modal is shown with the DM copy and the hold runs once it is dismissed
        expect(mockShowHoldSubmitterEducationalModal).toHaveBeenCalledWith({isDM: true});
        expect(mockShowHoldOrRejectEducationalModal).not.toHaveBeenCalled();
        expect(performHold).toHaveBeenCalledTimes(1);
    });

    it('should show the reject modal to an approver and hold once it is dismissed', async () => {
        // Given an approver who has not seen the reject explanation yet
        const contextMenu = renderContextMenu();
        await waitForBatchedUpdatesWithAct();
        const performHold = jest.fn();

        // When they hold someone else's expense from the context menu and close the modal
        act(() => contextMenu.handleHoldEducationalModal(performHold, approverWorkspaceChat));
        await waitForBatchedUpdatesWithAct();

        // Then the reject modal is shown, the reject explanation is marked as dismissed and the hold runs
        expect(mockShowHoldOrRejectEducationalModal).toHaveBeenCalledTimes(1);
        expect(mockShowHoldSubmitterEducationalModal).not.toHaveBeenCalled();
        expect(dismissRejectUseExplanation).toHaveBeenCalledTimes(1);
        expect(performHold).toHaveBeenCalledTimes(1);
    });

    it('should hold right away when the approver already dismissed the reject explanation', async () => {
        // Given an approver who already dismissed the reject explanation
        await Onyx.set(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION, true);
        const contextMenu = renderContextMenu();
        await waitForBatchedUpdatesWithAct();
        const performHold = jest.fn();

        // When they hold someone else's expense from the context menu
        act(() => contextMenu.handleHoldEducationalModal(performHold, approverWorkspaceChat));
        await waitForBatchedUpdatesWithAct();

        // Then the hold runs without any educational modal
        expect(performHold).toHaveBeenCalledTimes(1);
        expect(mockShowHoldOrRejectEducationalModal).not.toHaveBeenCalled();
        expect(mockShowHoldSubmitterEducationalModal).not.toHaveBeenCalled();
    });
});
