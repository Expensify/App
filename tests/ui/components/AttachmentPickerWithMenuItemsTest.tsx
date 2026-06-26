import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import AttachmentPickerWithMenuItems from '@pages/inbox/report/ReportActionCompose/AttachmentPickerWithMenuItems';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Report} from '@src/types/onyx';

import type * as NativeNavigation from '@react-navigation/native';
import type {View} from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockOpenCreateReportConfirmation = jest.fn();

jest.mock('@hooks/useCreateEmptyReportConfirmation', () => () => ({
    openCreateReportConfirmation: mockOpenCreateReportConfirmation,
}));

jest.mock('@react-navigation/native', () => ({
    ...((): typeof NativeNavigation => jest.requireActual('@react-navigation/native'))(),
    useNavigation: jest.fn(() => ({navigate: jest.fn(), addListener: jest.fn(() => jest.fn())})),
    useIsFocused: jest.fn(() => true),
    useRoute: jest.fn(() => ({key: '', name: '', params: {reportID: '1'}})),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((cb: () => void) => cb()),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isTopmostRouteModalScreen: jest.fn(() => false),
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- ignore for testing
const {View: MockView, Pressable: MockPressable, Text: MockText} = jest.requireActual('react-native');
jest.mock('@components/PopoverMenu', () => ({menuItems, onItemSelected}: {menuItems: Array<{text: string; onSelected: () => void}>; onItemSelected?: () => void}) => (
    <MockView>
        {menuItems?.map((item: {text: string; onSelected: () => void}) => (
            <MockPressable
                key={item.text}
                accessibilityRole="button"
                onPress={() => {
                    item.onSelected();
                    onItemSelected?.();
                }}
            >
                <MockText>{item.text}</MockText>
            </MockPressable>
        ))}
    </MockView>
));

jest.mock(
    '@components/AttachmentPicker',
    () =>
        ({children}: {children: (args: {openPicker: () => void}) => React.ReactNode}) =>
            children({openPicker: jest.fn()}),
);

jest.mock('@libs/actions/Report', () => ({
    createNewReport: jest.fn(() => ({reportID: 'mock-report-id'})),
    setIsComposerFullSize: jest.fn(),
}));

jest.mock('@libs/actions/Task', () => ({
    clearOutTaskInfoAndNavigate: jest.fn(),
}));

jest.mock('@libs/actions/Modal', () => ({
    close: jest.fn(),
}));

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'user@test.com';
const MOCK_POLICY_ID = 'policy-123';
const MOCK_REPORT_ID = 'report-456';

const MOCK_REPORT: Report = {
    reportID: MOCK_REPORT_ID,
    policyID: MOCK_POLICY_ID,
    ownerAccountID: CURRENT_USER_ACCOUNT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
};

const MOCK_PERSONAL_DETAILS: PersonalDetails = {
    accountID: CURRENT_USER_ACCOUNT_ID,
    login: CURRENT_USER_EMAIL,
    displayName: 'Test User',
};

function renderComponent() {
    const actionButtonRef = React.createRef<View>();
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <AttachmentPickerWithMenuItems
                report={MOCK_REPORT}
                currentUserPersonalDetails={MOCK_PERSONAL_DETAILS}
                reportID={MOCK_REPORT_ID}
                onAttachmentPicked={jest.fn()}
                isFullComposerAvailable
                isComposerFullSize={false}
                disabled={false}
                setMenuVisibility={jest.fn()}
                isMenuVisible
                onTriggerAttachmentPicker={jest.fn()}
                onCanceledAttachmentPicker={jest.fn()}
                onMenuClosed={jest.fn()}
                onAddActionPressed={jest.fn()}
                onItemSelected={jest.fn()}
                actionButtonRef={actionButtonRef}
                raiseIsScrollLikelyLayoutTriggered={jest.fn()}
            />
        </ComposeProviders>,
    );
}

describe('AttachmentPickerWithMenuItems - empty report confirmation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {
                accountID: CURRENT_USER_ACCOUNT_ID,
                email: CURRENT_USER_EMAIL,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`, {
                id: MOCK_POLICY_ID,
                name: 'Test Workspace',
                type: CONST.POLICY.TYPE.TEAM,
                role: CONST.POLICY.ROLE.ADMIN,
                isPolicyExpenseChatEnabled: true,
                pendingAction: null,
                owner: CURRENT_USER_EMAIL,
                outputCurrency: CONST.CURRENCY.USD,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${MOCK_REPORT_ID}`, MOCK_REPORT);
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('opens confirmation modal when an empty report exists and confirmation is not dismissed', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}empty-report`, {
                reportID: 'empty-report',
                policyID: MOCK_POLICY_ID,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                total: 0,
                nonReimbursableTotal: 0,
            });
        });
        await waitForBatchedUpdatesWithAct();

        renderComponent();
        await waitForBatchedUpdatesWithAct();

        const createReportItem = screen.getByText(translateLocal('report.newReport.createReport'));
        fireEvent.press(createReportItem);
        await waitForBatchedUpdatesWithAct();

        expect(mockOpenCreateReportConfirmation).toHaveBeenCalled();
    });

    it('does not open confirmation modal when confirmation has been dismissed', async () => {
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}empty-report`, {
                reportID: 'empty-report',
                policyID: MOCK_POLICY_ID,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                total: 0,
                nonReimbursableTotal: 0,
            });
            await Onyx.merge(ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED, true);
        });
        await waitForBatchedUpdatesWithAct();

        renderComponent();
        await waitForBatchedUpdatesWithAct();

        const createReportItem = screen.getByText(translateLocal('report.newReport.createReport'));
        fireEvent.press(createReportItem);
        await waitForBatchedUpdatesWithAct();

        expect(mockOpenCreateReportConfirmation).not.toHaveBeenCalled();
    });
});
