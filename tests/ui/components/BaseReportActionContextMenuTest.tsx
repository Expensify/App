import {act, render, waitFor} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import BaseReportActionContextMenu from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PersonalDetailsList} from '@src/types/onyx';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@components/ActionSheetAwareScrollView', () => ({
    useActionSheetAwareScrollViewActions: () => ({
        transitionActionSheetState: jest.fn(),
    }),
}));

type MockContextMenuItemProps = {
    sentryLabel?: string;
    onPress?: (event: unknown) => void;
    [key: string]: unknown;
};

const mockContextMenuItemProps: MockContextMenuItemProps[] = [];

jest.mock('@components/ContextMenuItem', () => {
    function MockContextMenuItem(props: MockContextMenuItemProps) {
        const {sentryLabel, onPress} = props;
        mockContextMenuItemProps.push({...props, sentryLabel, onPress});
        return null;
    }

    return MockContextMenuItem;
});

jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    useDelegateNoAccessState: () => ({isDelegateAccessRestricted: false}),
    useDelegateNoAccessActions: () => ({showDelegateNoAccessModal: jest.fn()}),
}));

jest.mock('@components/FocusTrap/FocusTrapForModal', () => {
    function MockFocusTrapForModal({children}: {children: React.ReactNode}) {
        return children;
    }

    return MockFocusTrapForModal;
});

jest.mock('@components/OnyxListItemProvider', () => ({
    useSession: () => ({encryptedAuthToken: 'token'}),
}));

jest.mock('@hooks/useArrowKeyFocusManager', () => () => [-1, jest.fn()] as const);
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 1, login: 'user@test.com', email: 'user@test.com'}));
jest.mock('@hooks/useEnvironment', () => () => ({isProduction: false}));
jest.mock('@hooks/useGetExpensifyCardFromReportAction', () => () => undefined);
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({
        Bell: undefined,
        Bug: undefined,
        ChatBubbleReply: undefined,
        ChatBubbleUnread: undefined,
        Checkmark: undefined,
        Concierge: undefined,
        Copy: undefined,
        Download: undefined,
        Exit: undefined,
        Flag: undefined,
        LinkCopy: undefined,
        Mail: undefined,
        Pencil: undefined,
        Pin: undefined,
        Stopwatch: undefined,
        ThreeDots: undefined,
        Trashcan: undefined,
    }),
}));

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
    getLocalDateFromDatetime: jest.fn(),
}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/usePaginatedReportActions', () => () => ({reportActions: []}));
jest.mock('@hooks/useReportIsArchived', () => () => false);
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: true, isSmallScreenWidth: false}));
jest.mock('@hooks/useRestoreInputFocus', () => () => {});
jest.mock(
    '@hooks/useStyleUtils',
    () => () =>
        new Proxy(
            {},
            {
                get: () => () => ({}),
            },
        ),
);
jest.mock('@hooks/useTransactionsAndViolationsForReport', () => () => ({transactions: {}}));

jest.mock('@userActions/Session', () => ({
    isAnonymousUser: () => false,
    signOutAndRedirectToSignIn: jest.fn(),
    callFunctionIfActionIsAllowed: (fn: () => void) => fn,
}));

jest.mock('@pages/inbox/report/ContextMenu/ReportActionContextMenu', () => ({
    hideContextMenu: jest.fn((_: boolean, onHideCallback?: () => void) => onHideCallback?.()),
    showContextMenu: jest.fn(),
}));

const mockUnholdRequest = jest.fn();
jest.mock('@libs/actions/IOU/Hold', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports -- Ignoring type errors for testing purposes
    const actual = jest.requireActual<typeof import('@libs/actions/IOU/Hold')>('@libs/actions/IOU/Hold');
    return {
        ...actual,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- Ignoring type errors for testing purposes
        unholdRequest: (...args: Parameters<typeof actual.unholdRequest>) => mockUnholdRequest(...args),
    };
});

const mockNavigate = jest.fn();
const mockSetParams = jest.fn();
const mockIsReady = jest.fn(() => false);
const mockGetActiveRoute = jest.fn(() => '');
const mockGetCurrentRoute = jest.fn(() => undefined as {name: string; params: Record<string, unknown>} | undefined);

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: (...args: unknown[]) => mockNavigate(...args) as void,
    setParams: (...args: unknown[]) => mockSetParams(...args) as void,
    getActiveRoute: () => mockGetActiveRoute(),
    navigationRef: {
        isReady: () => mockIsReady(),
        getCurrentRoute: () => mockGetCurrentRoute(),
    },
}));

const currentUserAccountID = 1;
const originalReportID = '100';
const reportActionID = '200';
const childReportID = '300';
const iouReportID = '400';
const transactionID = '500';
const policyID = 'policy1';
const holdActionID = 'holdAction1';
const testPersonalDetails: PersonalDetailsList = {
    [currentUserAccountID]: {
        accountID: currentUserAccountID,
        login: 'user@test.com',
        displayName: 'Test User',
    },
};
async function seedOnyxData({isOnHold}: {isOnHold: boolean}) {
    await Onyx.clear();

    // Session and personal details for current user (needed by canHoldUnholdReportAction / canModifyHoldStatus)
    await Onyx.merge(ONYXKEYS.SESSION, {
        accountID: currentUserAccountID,
        email: 'user@test.com',
    });

    await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, testPersonalDetails);

    // Policy (needed by canModifyHoldStatus for isPolicyAdmin, and by changeMoneyRequestHoldStatus)
    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        id: policyID,
        type: CONST.POLICY.TYPE.TEAM,
        role: CONST.POLICY.ROLE.ADMIN,
    });

    // Original report (chat report containing the report action)
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`, {
        reportID: originalReportID,
        type: CONST.REPORT.TYPE.CHAT,
    });

    // Report actions on the original report
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
        [reportActionID]: {
            reportActionID,
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            childReportID,
        },
        parentIOUAction: {
            reportActionID: 'parentIOUAction',
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            actorAccountID: currentUserAccountID,
            childReportID,
            originalMessage: {
                IOUReportID: iouReportID,
                IOUTransactionID: transactionID,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            },
        },
    });

    // Child report (expense report) linked from the report action
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${childReportID}`, {
        reportID: childReportID,
        type: CONST.REPORT.TYPE.EXPENSE,
        parentReportID: originalReportID,
        parentReportActionID: 'parentIOUAction',
        policyID,
        managerID: currentUserAccountID,
        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
    });

    // Report actions on child report
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID}`, {
        iouAction: {
            reportActionID: 'iouAction',
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            actorAccountID: currentUserAccountID,
            childReportID,
            originalMessage: {
                IOUReportID: iouReportID,
                IOUTransactionID: transactionID,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            },
        },
        ...(isOnHold
            ? {
                  [holdActionID]: {
                      reportActionID: holdActionID,
                      actionName: CONST.REPORT.ACTIONS.TYPE.HOLD,
                      actorAccountID: currentUserAccountID,
                  },
              }
            : {}),
    });

    // IOU report referenced by the money request action
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, {
        reportID: iouReportID,
        type: CONST.REPORT.TYPE.EXPENSE,
        policyID,
        managerID: currentUserAccountID,
        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
    });

    // Transaction (on hold or not)
    await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        transactionID,
        reportID: iouReportID,
        comment: isOnHold ? {hold: holdActionID} : {},
    });

    await waitForBatchedUpdates();
}

async function getContextMenuItemOnPress(sentryLabel: string): Promise<(event: unknown) => void> {
    let contextMenuItem = mockContextMenuItemProps.find((item) => item.sentryLabel === sentryLabel);

    await waitFor(() => {
        contextMenuItem = mockContextMenuItemProps.find((item) => item.sentryLabel === sentryLabel);
        expect(contextMenuItem).toBeDefined();
        expect(contextMenuItem?.onPress).toBeDefined();
    });

    return contextMenuItem?.onPress ?? (() => undefined);
}

describe('BaseReportActionContextMenu edit action', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        mockContextMenuItemProps.length = 0;
    });

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
    });

    it('shows the edit action for an editable comment by current user', async () => {
        await seedOnyxData({isOnHold: false});

        // Override the report action to be a plain ADD_COMMENT (editable)
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
            [reportActionID]: {
                reportActionID,
                actorAccountID: currentUserAccountID,
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                message: [
                    {
                        type: 'COMMENT',
                        html: 'Hello world',
                        text: 'Hello world',
                    },
                ],
                created: '2025-03-05 16:34:27',
            },
        });
        await waitForBatchedUpdates();

        render(
            <BaseReportActionContextMenu
                reportID={originalReportID}
                originalReportID={originalReportID}
                reportActionID={reportActionID}
                isVisible
            />,
        );

        await waitFor(() => {
            const editItem = mockContextMenuItemProps.find((item) => item.sentryLabel === CONST.SENTRY_LABEL.CONTEXT_MENU.EDIT_COMMENT);
            expect(editItem).toBeDefined();
        });
    });

    it('does not show the edit action for a comment by another user', async () => {
        await seedOnyxData({isOnHold: false});

        const otherUserAccountID = 999;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`, {
            [reportActionID]: {
                reportActionID,
                actorAccountID: otherUserAccountID,
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                message: [
                    {
                        type: 'COMMENT',
                        html: 'Hello from another user',
                        text: 'Hello from another user',
                    },
                ],
                created: '2025-03-05 16:34:27',
            },
        });
        await waitForBatchedUpdates();

        render(
            <BaseReportActionContextMenu
                reportID={originalReportID}
                originalReportID={originalReportID}
                reportActionID={reportActionID}
                isVisible
            />,
        );

        await waitForBatchedUpdates();
        const editItem = mockContextMenuItemProps.find((item) => item.sentryLabel === CONST.SENTRY_LABEL.CONTEXT_MENU.EDIT_COMMENT);
        expect(editItem).toBeUndefined();
    });
});

describe('BaseReportActionContextMenu hold/unhold action', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        mockContextMenuItemProps.length = 0;
    });

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS, evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS]});
    });

    it('navigates to hold reason page when pressing the hold action', async () => {
        await seedOnyxData({isOnHold: false});

        render(
            <BaseReportActionContextMenu
                reportID={originalReportID}
                originalReportID={originalReportID}
                reportActionID={reportActionID}
                isVisible
            />,
        );

        const onPress = await getContextMenuItemOnPress(CONST.SENTRY_LABEL.CONTEXT_MENU.HOLD);
        await act(async () => {
            onPress({});
        });

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.MONEY_REQUEST_HOLD_REASON.getRoute(CONST.POLICY.TYPE.TEAM, transactionID, childReportID, encodeURIComponent(mockGetActiveRoute())));
    });

    it('calls unholdRequest when pressing the unhold action', async () => {
        await seedOnyxData({isOnHold: true});

        render(
            <BaseReportActionContextMenu
                reportID={originalReportID}
                originalReportID={originalReportID}
                reportActionID={reportActionID}
                isVisible
            />,
        );

        const onPress = await getContextMenuItemOnPress(CONST.SENTRY_LABEL.CONTEXT_MENU.UNHOLD);
        await act(async () => {
            onPress({});
        });

        expect(mockUnholdRequest).toHaveBeenCalledTimes(1);
        expect(mockUnholdRequest).toHaveBeenCalledWith(transactionID, childReportID, expect.objectContaining({id: policyID}), false);
    });
});
