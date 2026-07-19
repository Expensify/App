/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
import {render} from '@testing-library/react-native';

import MoneyRequestReportActionsList from '@components/MoneyRequestReportView/MoneyRequestReportActionsList';
import MoneyRequestReportView from '@components/MoneyRequestReportView/MoneyRequestReportView';

import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import * as MoneyRequestReportUtils from '@libs/MoneyRequestReportUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';

import ReportActionsList from '@pages/inbox/report/ReportActionsList';
import UserTypingEventListener from '@pages/inbox/report/UserTypingEventListener';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {LayoutChangeEvent} from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = '777';

jest.mock('@hooks/useNetwork', () => jest.fn());
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@hooks/usePaginatedReportActions', () => jest.fn());
jest.mock('@hooks/useReportTransactionsCollection', () => jest.fn());

// useThemeStyles throws without a <ThemeStylesProvider>; return a proxy that yields an empty style object
// for any key so the (mostly-mocked) tree renders without wiring up the full provider stack.
jest.mock('@hooks/useThemeStyles', () => {
    const styleProxy = new Proxy({}, {get: () => ({})});
    return jest.fn(() => styleProxy);
});

// The children whose mounting we assert on are mocked so these tests observe only MoneyRequestReportView's
// branch decision (table view vs. chat body + typing listener), not the children's internals.
jest.mock('@components/MoneyRequestReportView/MoneyRequestReportActionsList', () => jest.fn(() => null));
jest.mock('@pages/inbox/report/ReportActionsList', () => jest.fn(() => null));
jest.mock('@pages/inbox/report/UserTypingEventListener', () => jest.fn(() => null));

// Header / footer / receipt children are stubbed to keep the render lightweight; OfflineWithFeedback must
// pass its children through because the chat body is mounted inside it.
jest.mock('@components/MoneyReportHeader', () => jest.fn(() => null));
jest.mock('@components/MoneyRequestHeader', () => jest.fn(() => null));
jest.mock('@components/CollapsibleHeaderOnKeyboard', () => jest.fn(() => null));
jest.mock('@components/ReportActionItem/MoneyRequestReceiptView', () => jest.fn(() => null));
jest.mock('@pages/inbox/report/ReportFooter', () => jest.fn(() => null));
jest.mock('@components/OfflineWithFeedback', () => {
    const reactModule = jest.requireActual<typeof React>('react');
    return jest.fn(({children}: {children: React.ReactNode}) => reactModule.createElement(reactModule.Fragment, null, children));
});

const mockUseNetwork = useNetwork as jest.MockedFunction<typeof useNetwork>;
const mockUseOnyx = useOnyx as jest.MockedFunction<typeof useOnyx>;
const mockUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;
const mockUsePaginatedReportActions = usePaginatedReportActions as jest.MockedFunction<typeof usePaginatedReportActions>;
const mockUseReportTransactionsCollection = useReportTransactionsCollection as jest.MockedFunction<typeof useReportTransactionsCollection>;
const mockMoneyRequestReportActionsList = MoneyRequestReportActionsList as jest.MockedFunction<typeof MoneyRequestReportActionsList>;
const mockReportActionsListBody = ReportActionsList as jest.MockedFunction<typeof ReportActionsList>;
const mockUserTypingEventListener = UserTypingEventListener as jest.MockedFunction<typeof UserTypingEventListener>;

const defaultPaginatedReportActionsResult: ReturnType<typeof usePaginatedReportActions> = {
    reportActions: [],
    linkedAction: undefined,
    oldestUnreadReportAction: undefined,
    sortedAllReportActions: undefined,
    hasNewerActions: false,
    hasOlderActions: false,
    report: undefined,
};

const mockReport: OnyxTypes.Report = {
    reportID: REPORT_ID,
    reportName: 'Money Request Report',
    chatReportID: '888',
    ownerAccountID: 1,
    lastVisibleActionCreated: '2024-01-01',
    total: 0,
};

const mockReportLoadingState: OnyxTypes.ReportLoadingState = {
    isLoadingInitialReportActions: false,
    isLoadingOlderReportActions: false,
    hasLoadingOlderReportActionsError: false,
    isLoadingNewerReportActions: false,
    hasLoadingNewerReportActionsError: false,
    hasOnceLoadedReportActions: true,
};

// A single non-empty action so the component clears its "no actions yet" skeleton and reaches the branch.
const mockReportActions: OnyxTypes.ReportAction[] = [
    {
        reportActionID: 'a1',
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        created: '2024-01-01',
        actorAccountID: 1,
        message: [{type: 'COMMENT', html: 'Hi', text: 'Hi'}],
        originalMessage: {},
        shouldShow: true,
        person: [{type: 'TEXT', style: 'strong', text: 'User'}],
        pendingAction: null,
        errors: {},
    },
];

const renderMoneyRequestReportView = (onLayout: (event: LayoutChangeEvent) => void) =>
    render(
        <MoneyRequestReportView
            report={mockReport}
            reportLoadingState={mockReportLoadingState}
            shouldDisplayReportFooter={false}
            backToRoute={undefined}
            onLayout={onLayout}
        />,
    );

describe('MoneyRequestReportView', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();

        mockUseNetwork.mockReturnValue({isOffline: false});
        mockUsePaginatedReportActions.mockReturnValue(defaultPaginatedReportActionsResult);
        mockUseReportTransactionsCollection.mockReturnValue({});
        mockUseResponsiveLayout.mockReturnValue({
            shouldUseNarrowLayout: false,
            isSmallScreenWidth: false,
            isInNarrowPaneModal: false,
            isExtraSmallScreenHeight: false,
            isMediumScreenWidth: false,
            isLargeScreenWidth: true,
            isExtraLargeScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isSmallScreen: false,
            onboardingIsMediumOrLargerScreenWidth: true,
            isInLandscapeMode: false,
        });
        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.IS_LOADING_APP) {
                return [false, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        // Drive the branch deterministically: no transactions, a resolved transaction-thread id (so the
        // report isn't treated as empty), and a non-empty filtered action set.
        jest.spyOn(MoneyRequestReportUtils, 'getAllNonDeletedTransactions').mockReturnValue([]);
        jest.spyOn(MoneyRequestReportUtils, 'shouldWaitForTransactions').mockReturnValue(false);
        jest.spyOn(MoneyRequestReportUtils, 'shouldDisplayReportTableView').mockReturnValue(false);
        jest.spyOn(ReportActionsUtils, 'getFilteredReportActionsForReportView').mockReturnValue(mockReportActions);
        jest.spyOn(ReportActionsUtils, 'getOneTransactionThreadReportID').mockReturnValue('thread-1');
    });

    afterEach(async () => {
        await waitForBatchedUpdatesWithAct();
        await Onyx.clear();
    });

    it('mounts the chat list body and the typing listener (not the table view) for a transaction-thread report', () => {
        const onLayout = jest.fn();

        renderMoneyRequestReportView(onLayout);

        expect(mockMoneyRequestReportActionsList).not.toHaveBeenCalled();
        expect(mockReportActionsListBody).toHaveBeenCalled();
        // The body is fed the report's own id and the warm-timing onLayout is forwarded through.
        expect(mockReportActionsListBody.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({reportID: REPORT_ID, onLayout}));
        // Typing is preserved in the transaction-thread view by mounting the listener as a sibling of the body.
        expect(mockUserTypingEventListener).toHaveBeenCalled();
        expect(mockUserTypingEventListener.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({report: mockReport}));
    });

    it('mounts the money-request table view (not the chat body or typing listener) when a table view should display', () => {
        jest.spyOn(MoneyRequestReportUtils, 'shouldDisplayReportTableView').mockReturnValue(true);

        renderMoneyRequestReportView(jest.fn());

        expect(mockMoneyRequestReportActionsList).toHaveBeenCalled();
        expect(mockReportActionsListBody).not.toHaveBeenCalled();
        expect(mockUserTypingEventListener).not.toHaveBeenCalled();
    });
});
