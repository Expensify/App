import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import MoneyRequestReportActionsList from '@components/MoneyRequestReportView/MoneyRequestReportActionsList';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import {SearchContextProvider} from '@components/Search/SearchContextProvider';

import useNetworkWithOfflineStatus from '@hooks/useNetworkWithOfflineStatus';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';

import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, Session} from '@src/types/onyx';

import type * as CoreNavigation from '@react-navigation/core';
import type ReactNative from 'react-native';

import * as NativeNavigation from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = '100001';
const POLICY_ID = 'FAKE_POLICY_001';
const ACCOUNT_ID = 15593135;
const EMAIL = 'testuser@example.com';

type MockReportActionRendererProps = {
    reportAction: ReportAction;
    displayAsGroup: boolean;
    shouldDisplayNewMarker: boolean;
};

const mockReportActionRenderer = jest.fn((props: MockReportActionRendererProps) => (
    <View
        testID={`report-action-${props.reportAction.reportActionID}`}
        accessibilityLabel={props.displayAsGroup ? 'grouped' : 'single'}
        accessibilityHint={props.shouldDisplayNewMarker ? 'unread' : undefined}
    />
));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useNavigationState: () => true,
    usePreventRemove: jest.fn(),
    useRoute: () => ({
        key: 'test-key',
        name: 'Report',
        params: {reportID: REPORT_ID},
    }),
}));

jest.mock('@react-navigation/core', () => ({
    ...jest.requireActual<typeof CoreNavigation>('@react-navigation/core'),
    useNavigation: jest.fn(() => ({getState: jest.fn(() => undefined)})),
}));

jest.mock('@hooks/useRootNavigationState', () => jest.fn((selector: (state: undefined) => unknown) => selector(undefined)));
jest.mock('@hooks/usePaginatedReportActions', () => jest.fn());
jest.mock('@hooks/useNetworkWithOfflineStatus', () => jest.fn());
jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => jest.fn(() => ({shouldUseNarrowLayout: true})));
jest.mock('@hooks/useLoadReportActions', () => jest.fn(() => ({loadOlderChats: jest.fn(), loadNewerChats: jest.fn()})));
jest.mock('@hooks/useParentReportAction', () => jest.fn(() => undefined));
jest.mock('@navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn(() => false));

jest.mock('@rnmapbox/maps', () => ({
    default: jest.fn(),
    MarkerView: jest.fn(),
    setAccessToken: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    navigationRef: {
        getRootState: jest.fn(() => ({routes: [{name: 'Report'}]})),
        getCurrentRoute: jest.fn(() => ({name: 'Report', params: {}})),
        getState: jest.fn(() => ({})),
    },
    getActiveRoute: jest.fn(() => 'activeRoute'),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getDeepestFocusedScreen: jest.fn(() => undefined),
}));

jest.mock('@components/MoneyRequestReportView/SelectionToolbar', () => jest.fn(() => null));
jest.mock('@pages/inbox/report/ReportActionsListItemRenderer', () => (props: MockReportActionRendererProps) => mockReportActionRenderer(props));

jest.mock('@components/MoneyRequestReportView/MoneyRequestReportTransactionList', () => {
    const {View: MockView} = jest.requireActual<typeof ReactNative>('react-native');
    return ({visibleReportActions, renderReportAction}: {visibleReportActions: ReportAction[]; renderReportAction: (reportAction: ReportAction, index: number) => React.ReactElement}) => (
        <MockView testID="MockMoneyRequestReportTransactionList">
            {visibleReportActions.map((reportAction, index) => (
                <MockView key={reportAction.reportActionID}>{renderReportAction(reportAction, index)}</MockView>
            ))}
        </MockView>
    );
});

const mockUsePaginatedReportActions = jest.mocked(usePaginatedReportActions);
const mockUseNetworkWithOfflineStatus = jest.mocked(useNetworkWithOfflineStatus);

const report: Report = {
    reportID: REPORT_ID,
    reportName: 'System message test report',
    chatReportID: '200001',
    ownerAccountID: ACCOUNT_ID,
    managerID: ACCOUNT_ID,
    policyID: POLICY_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    stateNum: CONST.REPORT.STATE_NUM.OPEN,
    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    currency: CONST.CURRENCY.USD,
    total: 0,
    unheldTotal: 0,
    lastVisibleActionCreated: '2026-08-02 00:00:04.000',
    permissions: [CONST.REPORT.PERMISSIONS.READ, CONST.REPORT.PERMISSIONS.WRITE],
};

const policy: Policy = {
    id: POLICY_ID,
    name: 'Test Workspace',
    role: CONST.POLICY.ROLE.ADMIN,
    type: CONST.POLICY.TYPE.CORPORATE,
    owner: EMAIL,
    ownerAccountID: ACCOUNT_ID,
    outputCurrency: CONST.CURRENCY.USD,
    avatarURL: '',
    employeeList: {
        [EMAIL]: {
            email: EMAIL,
            role: CONST.POLICY.ROLE.ADMIN,
        },
    },
    isPolicyExpenseChatEnabled: true,
} as Policy;

function makeAction(reportActionID: string, actionName: ReportAction['actionName'], created: string): ReportAction {
    return {
        reportActionID,
        reportID: REPORT_ID,
        actionName,
        actorAccountID: ACCOUNT_ID,
        created,
        message: [{type: 'TEXT', html: reportActionID, text: reportActionID}],
    } as ReportAction;
}

function renderComponent() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <SearchContextProvider>
                <ScreenWrapper testID="test">
                    <MoneyRequestReportActionsList />
                </ScreenWrapper>
            </SearchContextProvider>
        </ComposeProviders>,
    );
}

function getRenderedActionIDs(): string[] {
    return screen.getAllByTestId(/^report-action-/).map((element) => {
        const testID: unknown = element.props.testID;
        if (typeof testID !== 'string') {
            throw new Error('Expected every rendered report action to have a string testID');
        }
        return testID;
    });
}

TestHelper.setupApp();
TestHelper.setupGlobalFetchMock();

describe('MoneyRequestReportActionsList system-message presentation', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        jest.spyOn(NativeNavigation, 'useIsFocused').mockReturnValue(true);
        await TestHelper.signInWithTestUser(ACCOUNT_ID, EMAIL);
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockUseNetworkWithOfflineStatus.mockReturnValue({isOffline: false, lastOfflineAt: {current: undefined}, lastOnlineAt: {current: undefined}});
        jest.spyOn(NativeNavigation, 'useIsFocused').mockReturnValue(true);
        mockUsePaginatedReportActions.mockReturnValue({
            reportActions: [
                makeAction('system-singleton', CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, '2026-08-02 00:00:04.000'),
                makeAction('chat-boundary', CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, '2026-08-02 00:00:03.000'),
                makeAction('legacy-system', CONST.REPORT.ACTIONS.TYPE.CHANGE_FIELD, '2026-08-02 00:00:02.000'),
                makeAction('system-anchor', CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, '2026-08-02 00:00:01.000'),
            ],
            linkedAction: undefined,
            oldestUnreadReportAction: undefined,
            sortedAllReportActions: undefined,
            hasNewerActions: false,
            hasOlderActions: false,
            report: undefined,
        });

        await act(async () => {
            await Onyx.clear();
            await Onyx.multiSet({
                [`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}` as const]: report,
                [`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}` as const]: policy,
                [`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}` as const]: {isLoadingInitialReportActions: false, hasOnceLoadedReportActions: true},
                [ONYXKEYS.SESSION]: {accountID: ACCOUNT_ID, email: EMAIL} as Session,
            });
            await waitForBatchedUpdatesWithAct();
        });
    });

    it.each([false, true])('counts and expands only visible payment updates when waiting for a bank account is %s', async (isWaitingOnBankAccount) => {
        // Given an expense payment between the two oldest system updates
        const payment: ReportAction = {
            ...makeAction('expense-payment', CONST.REPORT.ACTIONS.TYPE.IOU, '2026-08-02 00:00:01.500'),
            originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.PAY},
        };
        mockUsePaginatedReportActions.mockReturnValue({
            reportActions: [
                makeAction('system-singleton', CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, '2026-08-02 00:00:04.000'),
                makeAction('chat-boundary', CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, '2026-08-02 00:00:03.000'),
                makeAction('legacy-system', CONST.REPORT.ACTIONS.TYPE.CHANGE_FIELD, '2026-08-02 00:00:02.000'),
                payment,
                makeAction('system-anchor', CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, '2026-08-02 00:00:01.000'),
            ],
            linkedAction: undefined,
            oldestUnreadReportAction: undefined,
            sortedAllReportActions: undefined,
            hasNewerActions: false,
            hasOlderActions: false,
            report: undefined,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {isWaitingOnBankAccount});

        // When the real money-request audit list constructs its summary
        renderComponent();
        await waitForBatchedUpdatesWithAct();
        const count = isWaitingOnBankAccount ? 2 : 3;
        const control = screen.getByRole('button', {name: `show ${count} updates`});
        expect(screen.queryByRole('button', {name: `show ${isWaitingOnBankAccount ? 3 : 2} updates`})).toBeNull();

        // Then expansion reveals exactly that many updates and uses normal row grouping
        fireEvent.press(control);
        await waitForBatchedUpdatesWithAct();
        expect(getRenderedActionIDs()).toEqual(
            isWaitingOnBankAccount
                ? ['report-action-system-anchor', 'report-action-legacy-system', 'report-action-chat-boundary', 'report-action-system-singleton']
                : ['report-action-system-anchor', 'report-action-expense-payment', 'report-action-legacy-system', 'report-action-chat-boundary', 'report-action-system-singleton'],
        );
        expect(screen.getByTestId('report-action-system-anchor').props.accessibilityLabel).toBe('single');
        expect(screen.getByTestId('report-action-legacy-system').props.accessibilityLabel).toBe('grouped');
        expect(screen.queryByRole('button', {name: /updates|Hide/})).toBeNull();
    });

    it.each([
        {
            hasPendingDeletion: false,
            manualAnchor: 'new-comment',
            lastReadTime: '2026-08-02 00:00:03.999',
            expectedMarker: 'new-comment',
            offlineStart: '2026-08-02 00:00:01.000',
            paymentCreated: '2026-08-02 00:00:03.000',
        },
        {
            hasPendingDeletion: true,
            manualAnchor: 'new-comment',
            lastReadTime: '2026-08-02 00:00:03.999',
            expectedMarker: 'new-comment',
            offlineStart: '2026-08-02 00:00:01.000',
            paymentCreated: '2026-08-02 00:00:00.500',
        },
        {
            hasPendingDeletion: true,
            manualAnchor: null,
            lastReadTime: '2026-08-02 00:00:00.999',
            expectedMarker: 'old-comment',
            offlineStart: '2026-08-02 00:00:01.000',
            paymentCreated: '2026-08-02 00:00:00.500',
        },
        {
            hasPendingDeletion: true,
            manualAnchor: 'old-comment',
            lastReadTime: '2026-08-02 00:00:01.999',
            expectedMarker: 'old-comment',
            offlineStart: '2026-08-02 00:00:03.000',
            paymentCreated: '2026-08-02 00:00:00.500',
        },
        {
            hasPendingDeletion: true,
            manualAnchor: 'hidden-payment',
            lastReadTime: '2026-08-02 00:00:00.499',
            expectedMarker: 'old-comment',
            offlineStart: '2026-08-02 00:00:01.000',
            paymentCreated: '2026-08-02 00:00:00.500',
        },
        {
            hasPendingDeletion: false,
            manualAnchor: null,
            lastReadTime: '2026-08-02 00:00:00.999',
            expectedMarker: 'old-comment',
            offlineStart: '2026-08-02 00:00:03.000',
            paymentCreated: '2026-08-02 00:00:00.500',
        },
    ])(
        'keeps a visible unread marker with hidden payment: $expectedMarker, pending deletion: $hasPendingDeletion',
        async ({hasPendingDeletion, manualAnchor, lastReadTime, expectedMarker, offlineStart, paymentCreated}) => {
            // Given persisted messages received during an offline window, optionally with a visible comment manually marked unread
            const otherAccountID = ACCOUNT_ID + 1;
            const actions: ReportAction[] = [
                {...makeAction('new-comment', CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, '2026-08-02 00:00:04.000'), actorAccountID: otherAccountID},
                ...(hasPendingDeletion
                    ? [{...makeAction('hidden-deleted-comment', CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, '2026-08-02 00:00:03.500'), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}]
                    : []),
                {
                    ...makeAction('hidden-payment', CONST.REPORT.ACTIONS.TYPE.IOU, paymentCreated),
                    actorAccountID: otherAccountID,
                    originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.PAY},
                },
                {...makeAction('old-comment', CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, '2026-08-02 00:00:02.000'), actorAccountID: otherAccountID},
                makeAction('created', CONST.REPORT.ACTIONS.TYPE.CREATED, '2026-08-02 00:00:00.000'),
            ];
            mockUsePaginatedReportActions.mockReturnValue({
                reportActions: actions.sort((a, b) => b.created.localeCompare(a.created)),
                linkedAction: undefined,
                oldestUnreadReportAction: undefined,
                sortedAllReportActions: undefined,
                hasNewerActions: false,
                hasOlderActions: false,
                report: undefined,
            });
            mockUseNetworkWithOfflineStatus.mockReturnValue({
                isOffline: false,
                lastOfflineAt: {current: DateUtils.getLocalDateFromDatetime(CONST.LOCALES.EN, CONST.DEFAULT_TIME_ZONE.selected, offlineStart)},
                lastOnlineAt: {current: DateUtils.getLocalDateFromDatetime(CONST.LOCALES.EN, CONST.DEFAULT_TIME_ZONE.selected, '2026-08-02 00:00:05.000')},
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
                isWaitingOnBankAccount: true,
                lastReadTime,
                manuallyMarkedUnreadReportActionID: manualAnchor,
            });

            // When the real list and unread hook scan the oldest-first visible action chain
            renderComponent();
            await waitForBatchedUpdatesWithAct();

            // Then the hidden row does not shift the offline boundary past the visible list or remove the New divider
            expect(getRenderedActionIDs()).toEqual(['report-action-old-comment', 'report-action-new-comment']);
            expect(screen.getByTestId(`report-action-${expectedMarker}`).props.accessibilityHint).toBe('unread');
            expect(screen.getByTestId(`report-action-${expectedMarker === 'new-comment' ? 'old-comment' : 'new-comment'}`).props.accessibilityHint).toBeUndefined();
        },
    );

    it('expands the real audit list into normal rows and removes the control', async () => {
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        const collapsedControl = screen.getByRole('button', {name: 'show 2 updates'});
        expect(collapsedControl.props.accessibilityState).toMatchObject({expanded: false});
        expect(getRenderedActionIDs()).toEqual(['report-action-chat-boundary', 'report-action-system-singleton']);
        expect(screen.getByTestId('report-action-chat-boundary').props.accessibilityLabel).toBe('single');
        expect(screen.getByTestId('report-action-system-singleton').props.accessibilityLabel).toBe('grouped');

        fireEvent.press(collapsedControl);
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByRole('button', {name: 'show 2 updates'})).toBeNull();
        expect(screen.queryByRole('button', {name: /Hide/})).toBeNull();
        expect(getRenderedActionIDs()).toEqual(['report-action-system-anchor', 'report-action-legacy-system', 'report-action-chat-boundary', 'report-action-system-singleton']);
        expect(screen.getByTestId('report-action-system-anchor').props.accessibilityLabel).toBe('single');
        expect(screen.getByTestId('report-action-legacy-system').props.accessibilityLabel).toBe('grouped');
        expect(screen.getByTestId('report-action-chat-boundary').props.accessibilityLabel).toBe('grouped');
    });
});
