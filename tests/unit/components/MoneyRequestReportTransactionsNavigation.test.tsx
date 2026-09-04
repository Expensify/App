import {fireEvent, render, screen} from '@testing-library/react-native';

import MoneyRequestReportTransactionsNavigation from '@components/MoneyRequestReportView/MoneyRequestReportTransactionsNavigation';

import {createTransactionThreadReport} from '@libs/actions/Report';
import {clearActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import {getReportIDToOpenForExpense} from '@libs/TransactionThreadNavigationUtils';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import React from 'react';

/**
 * These tests verify the navigation resolution of MoneyRequestReportTransactionsNavigation:
 * given a transaction list (and optionally a search snapshot), pressing prev/next should resolve
 * and navigate to the correct target reportID for each direction. The heavy hooks are mocked so
 * the real selectors and the onNext/onPrevious branching logic are exercised in isolation.
 */

type MockOnyxState = {
    transactionIDsList: string[] | undefined;
    snapshotHash: string | undefined;
    snapshot: {data: Record<string, unknown>} | undefined;
    siblingDescriptors: Record<string, unknown> | undefined;
    transactionsCollection: Record<string, unknown>;
    reportActionsCollection: Record<string, unknown>;
    reportsCollection: Record<string, unknown>;
};

const mockState: MockOnyxState = {
    transactionIDsList: undefined,
    snapshotHash: undefined,
    snapshot: undefined,
    siblingDescriptors: undefined,
    transactionsCollection: {},
    reportActionsCollection: {},
    reportsCollection: {},
};

const mockUseOnyx = jest.fn();
const mockMarkReportRHPWidth = jest.fn();

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    default: (...args: unknown[]) => mockUseOnyx(...args),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({}),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string, params?: Record<string, unknown>) => (params ? `${key}:${JSON.stringify(params)}` : key)}),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 1, email: 'me@example.com'}),
}));

jest.mock('@components/WideRHPContextProvider', () => ({
    useWideRHPActions: () => ({markReportRHPWidth: mockMarkReportRHPWidth}),
}));

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: () => ({}),
}));

type ReactActual = {createElement: typeof React.createElement; Fragment: typeof React.Fragment};
type ReactNativeActual = {
    Pressable: React.ComponentType<{testID?: string; disabled?: boolean; onPress?: () => void}>;
    Text: React.ComponentType<{children?: React.ReactNode}>;
};

jest.mock('@components/Text', () => {
    const {Text} = jest.requireActual<ReactNativeActual>('react-native');
    return {__esModule: true, default: Text};
});

jest.mock('@components/PrevNextButtons', () => {
    const ReactLib = jest.requireActual<ReactActual>('react');
    const {Pressable} = jest.requireActual<ReactNativeActual>('react-native');
    return {
        __esModule: true,
        default: (props: {onNext: () => void; onPrevious: () => void; isNextButtonDisabled?: boolean; isPrevButtonDisabled?: boolean}) =>
            ReactLib.createElement(
                ReactLib.Fragment,
                null,
                ReactLib.createElement(Pressable, {testID: 'prev-button', disabled: props.isPrevButtonDisabled, onPress: () => props.onPrevious()}),
                ReactLib.createElement(Pressable, {testID: 'next-button', disabled: props.isNextButtonDisabled, onPress: () => props.onNext()}),
            ),
    };
});

jest.mock('@navigation/Navigation', () => ({
    __esModule: true,
    default: {
        setParams: jest.fn(),
        getActiveRoute: jest.fn(() => 'active-route'),
    },
}));

const makeRootState = (focusedRouteName: string) => ({index: 0, routes: [{key: 'k', name: focusedRouteName}]});
const mockGetRootState = jest.fn(() => makeRootState('testRoute'));

jest.mock('@navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        getRootState: () => mockGetRootState(),
        getCurrentRoute: jest.fn(() => undefined),
    },
}));

jest.mock('@libs/actions/Report', () => ({
    createTransactionThreadReport: jest.fn(() => undefined),
    setOptimisticTransactionThread: jest.fn(),
}));

jest.mock('@libs/actions/TransactionThreadNavigation', () => ({
    clearActiveTransactionIDs: jest.fn(),
}));

jest.mock('@libs/TransactionThreadNavigationUtils', () => ({
    getReportIDToOpenForExpense: jest.fn(() => 'resolved-descriptor-report'),
}));

const makeIOUAction = (transactionID: string, {childReportID, reportID}: {childReportID?: string; reportID: string}) => ({
    reportActionID: `action_${transactionID}`,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    originalMessage: {IOUTransactionID: transactionID, type: 'create'},
    childReportID,
    reportID,
});

const CURRENT_ID = 'tCur';
const PREV_ID = 'tPrev';
const NEXT_ID = 'tNext';

const resetMockState = () => {
    mockState.transactionIDsList = [PREV_ID, CURRENT_ID, NEXT_ID];
    mockState.snapshotHash = undefined;
    mockState.snapshot = undefined;
    mockState.siblingDescriptors = undefined;
    mockState.transactionsCollection = {};
    mockState.reportActionsCollection = {};
    mockState.reportsCollection = {};
    mockGetRootState.mockReturnValue(makeRootState('testRoute'));
};

const setupUseOnyx = () => {
    mockUseOnyx.mockImplementation((key: string, options?: {selector?: (data: unknown) => unknown}) => {
        const selector = options?.selector;
        if (key === ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS) {
            return [mockState.transactionIDsList];
        }
        if (key === ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_SNAPSHOT_HASH) {
            return [mockState.snapshotHash];
        }
        if (key === `${ONYXKEYS.COLLECTION.SNAPSHOT}${mockState.snapshotHash}`) {
            return [mockState.snapshot];
        }
        if (key === ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_THREAD_REPORT_IDS) {
            return [mockState.siblingDescriptors];
        }
        if (key === ONYXKEYS.COLLECTION.TRANSACTION) {
            return [selector ? selector(mockState.transactionsCollection) : undefined];
        }
        if (key === ONYXKEYS.COLLECTION.REPORT_ACTIONS) {
            return [selector ? selector(mockState.reportActionsCollection) : undefined];
        }
        if (key.startsWith(ONYXKEYS.COLLECTION.REPORT)) {
            return [mockState.reportsCollection[key]];
        }
        // NVP_ONBOARDING (selector-based), NVP_INTRO_SELECTED, BETAS and anything else are not relevant to resolution.
        return [undefined];
    });
};

const renderNavigation = () => render(<MoneyRequestReportTransactionsNavigation currentTransactionID={CURRENT_ID} />);

// Navigation.setParams is deferred inside requestAnimationFrame. Run it synchronously so the resolved
// navigation happens during the press and can be asserted immediately afterwards.
const press = (testID: string) => {
    global.requestAnimationFrame = (callback: FrameRequestCallback) => {
        callback(0);
        return 0;
    };
    fireEvent.press(screen.getByTestId(testID));
};

describe('MoneyRequestReportTransactionsNavigation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetMockState();
        setupUseOnyx();
    });

    describe('one-transaction parent report', () => {
        beforeEach(() => {
            mockState.transactionsCollection = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${CURRENT_ID}`]: {transactionID: CURRENT_ID, reportID: 'rCur'},
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${PREV_ID}`]: {transactionID: PREV_ID, reportID: 'rPrev'},
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${NEXT_ID}`]: {transactionID: NEXT_ID, reportID: 'rNext'},
            };
            mockState.reportsCollection = {
                [`${ONYXKEYS.COLLECTION.REPORT}rPrev`]: {reportID: 'rPrev', transactionCount: 1},
                [`${ONYXKEYS.COLLECTION.REPORT}rNext`]: {reportID: 'rNext', transactionCount: 1},
            };
        });

        it('navigates next to the parent reportID', () => {
            renderNavigation();

            press('next-button');

            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'rNext', reportActionID: undefined, anchorTransactionID: NEXT_ID}));
            expect(mockMarkReportRHPWidth).toHaveBeenCalledWith('rNext', 'wide');
        });

        it('navigates previous to the parent reportID', () => {
            renderNavigation();

            press('prev-button');

            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'rPrev', reportActionID: undefined, anchorTransactionID: PREV_ID}));
            expect(mockMarkReportRHPWidth).toHaveBeenCalledWith('rPrev', 'wide');
        });
    });

    describe('resolves siblings and parents from the search snapshot', () => {
        beforeEach(() => {
            // Live collections are intentionally empty; everything is only in the snapshot.
            mockState.snapshotHash = 'hash1';
            mockState.snapshot = {
                data: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${CURRENT_ID}`]: {transactionID: CURRENT_ID, reportID: 'rCur'},
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${PREV_ID}`]: {transactionID: PREV_ID, reportID: 'rPrev'},
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${NEXT_ID}`]: {transactionID: NEXT_ID, reportID: 'rNext'},
                    [`${ONYXKEYS.COLLECTION.REPORT}rPrev`]: {reportID: 'rPrev', transactionCount: 1},
                    [`${ONYXKEYS.COLLECTION.REPORT}rNext`]: {reportID: 'rNext', transactionCount: 1},
                },
            };
        });

        it('navigates next using snapshot-only data', () => {
            renderNavigation();

            press('next-button');

            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'rNext', anchorTransactionID: NEXT_ID}));
        });

        it('navigates previous using snapshot-only data', () => {
            renderNavigation();

            press('prev-button');

            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'rPrev', anchorTransactionID: PREV_ID}));
        });
    });

    describe('multi-transaction parent with an existing thread', () => {
        beforeEach(() => {
            mockState.transactionsCollection = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${CURRENT_ID}`]: {transactionID: CURRENT_ID, reportID: 'rCur'},
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${PREV_ID}`]: {transactionID: PREV_ID, reportID: 'rPrev'},
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${NEXT_ID}`]: {transactionID: NEXT_ID, reportID: 'rNext'},
            };
            mockState.reportActionsCollection = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}rPrev`]: {actionPrev: makeIOUAction(PREV_ID, {childReportID: 'threadPrev', reportID: 'rPrev'})},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}rNext`]: {actionNext: makeIOUAction(NEXT_ID, {childReportID: 'threadNext', reportID: 'rNext'})},
            };
            mockState.reportsCollection = {
                [`${ONYXKEYS.COLLECTION.REPORT}rPrev`]: {reportID: 'rPrev', transactionCount: 2},
                [`${ONYXKEYS.COLLECTION.REPORT}rNext`]: {reportID: 'rNext', transactionCount: 2},
            };
        });

        it('navigates next to the existing transaction thread reportID', () => {
            renderNavigation();

            press('next-button');

            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'threadNext', anchorTransactionID: NEXT_ID}));
            expect(mockMarkReportRHPWidth).toHaveBeenCalledWith('threadNext', 'wide');
        });

        it('navigates previous to the existing transaction thread reportID', () => {
            renderNavigation();

            press('prev-button');

            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'threadPrev', anchorTransactionID: PREV_ID}));
            expect(mockMarkReportRHPWidth).toHaveBeenCalledWith('threadPrev', 'wide');
        });
    });

    describe('live report actions take precedence over a stale snapshot copy', () => {
        beforeEach(() => {
            mockState.transactionsCollection = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${CURRENT_ID}`]: {transactionID: CURRENT_ID, reportID: 'rCur'},
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${PREV_ID}`]: {transactionID: PREV_ID, reportID: 'rPrev'},
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${NEXT_ID}`]: {transactionID: NEXT_ID, reportID: 'rNext'},
            };
            mockState.reportActionsCollection = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}rPrev`]: {actionPrev: makeIOUAction(PREV_ID, {childReportID: 'threadPrev', reportID: 'rPrev'})},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}rNext`]: {actionNext: makeIOUAction(NEXT_ID, {childReportID: 'threadNext', reportID: 'rNext'})},
            };
            mockState.reportsCollection = {
                [`${ONYXKEYS.COLLECTION.REPORT}rPrev`]: {reportID: 'rPrev', transactionCount: 2},
                [`${ONYXKEYS.COLLECTION.REPORT}rNext`]: {reportID: 'rNext', transactionCount: 2},
            };
            mockState.snapshotHash = 'hash1';
            mockState.snapshot = {
                data: {
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}rPrev`]: {actionPrev: makeIOUAction(PREV_ID, {reportID: 'rPrev'})},
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}rNext`]: {actionNext: makeIOUAction(NEXT_ID, {reportID: 'rNext'})},
                },
            };
        });

        it('navigates next to the live thread instead of creating a duplicate', () => {
            renderNavigation();

            press('next-button');

            expect(createTransactionThreadReport).not.toHaveBeenCalled();
            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'threadNext', anchorTransactionID: NEXT_ID}));
        });

        it('navigates previous to the live thread instead of creating a duplicate', () => {
            renderNavigation();

            press('prev-button');

            expect(createTransactionThreadReport).not.toHaveBeenCalled();
            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'threadPrev', anchorTransactionID: PREV_ID}));
        });
    });

    describe('multi-transaction parent without a thread', () => {
        beforeEach(() => {
            mockState.transactionsCollection = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${CURRENT_ID}`]: {transactionID: CURRENT_ID, reportID: 'rCur'},
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${PREV_ID}`]: {transactionID: PREV_ID, reportID: 'rPrev'},
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${NEXT_ID}`]: {transactionID: NEXT_ID, reportID: 'rNext'},
            };
            mockState.reportActionsCollection = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}rPrev`]: {actionPrev: makeIOUAction(PREV_ID, {reportID: 'rPrev'})},
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}rNext`]: {actionNext: makeIOUAction(NEXT_ID, {reportID: 'rNext'})},
            };
            mockState.reportsCollection = {
                [`${ONYXKEYS.COLLECTION.REPORT}rPrev`]: {reportID: 'rPrev', transactionCount: 2},
                [`${ONYXKEYS.COLLECTION.REPORT}rNext`]: {reportID: 'rNext', transactionCount: 2},
            };
        });

        // Thread creation is delegated to the shared resolver so that both directions — and the other screens that
        // open a single expense — agree on where an expense opens.
        it('resolves the target through the shared resolver and navigates next', () => {
            jest.mocked(getReportIDToOpenForExpense).mockReturnValue('createdNext');
            renderNavigation();

            press('next-button');

            expect(getReportIDToOpenForExpense).toHaveBeenCalledWith(
                expect.objectContaining({reportID: 'rNext', transaction: expect.objectContaining({transactionID: NEXT_ID})}),
                expect.anything(),
            );
            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'createdNext', anchorTransactionID: NEXT_ID}));
        });

        it('resolves the target through the shared resolver and navigates previous', () => {
            jest.mocked(getReportIDToOpenForExpense).mockReturnValue('createdPrev');
            renderNavigation();

            press('prev-button');

            expect(getReportIDToOpenForExpense).toHaveBeenCalledWith(
                expect.objectContaining({reportID: 'rPrev', transaction: expect.objectContaining({transactionID: PREV_ID})}),
                expect.anything(),
            );
            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'createdPrev', anchorTransactionID: PREV_ID}));
        });
    });

    describe('snapshot-backed sibling descriptors', () => {
        beforeEach(() => {
            mockState.transactionsCollection = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${CURRENT_ID}`]: {transactionID: CURRENT_ID, reportID: 'rCur'},
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${PREV_ID}`]: {transactionID: PREV_ID, reportID: 'rPrev'},
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${NEXT_ID}`]: {transactionID: NEXT_ID, reportID: 'rNext'},
            };
            // No parent report present -> not a one-transaction report, so resolution uses the descriptor.
            mockState.siblingDescriptors = {
                [PREV_ID]: {reportID: 'rPrev'},
                [NEXT_ID]: {reportID: 'rNext'},
            };
        });

        it('navigates next to the descriptor-resolved reportID', () => {
            jest.mocked(getReportIDToOpenForExpense).mockReturnValue('descNext');
            renderNavigation();

            press('next-button');

            expect(getReportIDToOpenForExpense).toHaveBeenCalled();
            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'descNext', anchorTransactionID: NEXT_ID}));
        });

        it('navigates previous to the descriptor-resolved reportID', () => {
            jest.mocked(getReportIDToOpenForExpense).mockReturnValue('descPrev');
            renderNavigation();

            press('prev-button');

            expect(getReportIDToOpenForExpense).toHaveBeenCalled();
            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'descPrev', anchorTransactionID: PREV_ID}));
        });
    });

    it('does not render navigation when there are fewer than two transactions', () => {
        mockState.transactionIDsList = [CURRENT_ID];

        renderNavigation();

        expect(screen.queryByTestId('next-button')).toBeNull();
    });

    /**
     * The carousel list is a snapshot of what another screen was showing when it seeded it, and it goes stale.
     * Validating it here is what keeps the counter and the arrows agreeing with what the user can actually reach.
     */
    describe('validates the seeded list against live transaction data', () => {
        const counterFor = (current: number, total: number) => `common.currentOfTotal:${JSON.stringify({current, total})}`;

        it('counts every sibling when they are all still live', () => {
            mockState.transactionsCollection = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${CURRENT_ID}`]: {transactionID: CURRENT_ID, reportID: 'rCur'},
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${PREV_ID}`]: {transactionID: PREV_ID, reportID: 'rPrev'},
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${NEXT_ID}`]: {transactionID: NEXT_ID, reportID: 'rNext'},
            };

            renderNavigation();

            expect(screen.getByText(counterFor(2, 3))).toBeTruthy();
        });

        // Regression guard for https://github.com/Expensify/App/issues/99617 (the counter kept counting a deleted
        // expense) and https://github.com/Expensify/App/issues/99614 (its arrow led to a "not here" page).
        it('drops a sibling that is queued for deletion', () => {
            mockState.transactionsCollection = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${CURRENT_ID}`]: {transactionID: CURRENT_ID, reportID: 'rCur'},
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${PREV_ID}`]: {transactionID: PREV_ID, reportID: 'rPrev'},
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${NEXT_ID}`]: {
                    transactionID: NEXT_ID,
                    reportID: 'rNext',
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            };

            renderNavigation();

            expect(screen.getByText(counterFor(2, 2))).toBeTruthy();
            // The deleted expense is no longer reachable: it was the last entry, so there is nothing after it.
            press('next-button');
            expect(Navigation.setParams).not.toHaveBeenCalled();
        });

        it('drops a sibling that has already been deleted', () => {
            mockState.transactionsCollection = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${CURRENT_ID}`]: {transactionID: CURRENT_ID, reportID: 'rCur'},
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${PREV_ID}`]: {transactionID: PREV_ID, reportID: CONST.REPORT.TRASH_REPORT_ID},
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${NEXT_ID}`]: {transactionID: NEXT_ID, reportID: 'rNext'},
            };

            renderNavigation();

            expect(screen.getByText(counterFor(1, 2))).toBeTruthy();
            press('prev-button');
            expect(Navigation.setParams).not.toHaveBeenCalled();
        });

        // A transaction that hasn't loaded yet is not a transaction that is gone: dropping those would shrink the
        // carousel under the user on a cold open (https://github.com/Expensify/App/issues/99641).
        it('keeps siblings that have not loaded into Onyx yet', () => {
            mockState.transactionsCollection = {};

            renderNavigation();

            expect(screen.getByText(counterFor(2, 3))).toBeTruthy();
        });

        // Regression guard for https://github.com/Expensify/App/issues/99616: after backing out of a report, the
        // report's list was left driving a thread that was never part of it, so the thread showed a foreign "x of y".
        it('renders nothing when the current expense is not one of the siblings', () => {
            mockState.transactionIDsList = [PREV_ID, NEXT_ID];

            renderNavigation();

            expect(screen.queryByTestId('next-button')).toBeNull();
            expect(screen.queryByTestId('prev-button')).toBeNull();
        });
    });

    /**
     * Regression guard for https://github.com/Expensify/App/issues/99611: paying, approving or rejecting an expense
     * produces further IOU actions carrying the same IOUTransactionID, each with its own thread. Paging onto one of
     * those opens a system message ("marked as paid") instead of the expense.
     */
    describe('ignores IOU actions that did not create the expense', () => {
        const makePayAction = (transactionID: string, {childReportID, reportID}: {childReportID: string; reportID: string}) => ({
            reportActionID: `pay_${transactionID}`,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            originalMessage: {IOUTransactionID: transactionID, type: CONST.IOU.REPORT_ACTION_TYPE.PAY},
            childReportID,
            reportID,
        });

        beforeEach(() => {
            mockState.transactionsCollection = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${CURRENT_ID}`]: {transactionID: CURRENT_ID, reportID: 'rCur'},
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${PREV_ID}`]: {transactionID: PREV_ID, reportID: 'rPrev'},
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${NEXT_ID}`]: {transactionID: NEXT_ID, reportID: 'rNext'},
            };
            mockState.reportsCollection = {
                [`${ONYXKEYS.COLLECTION.REPORT}rNext`]: {reportID: 'rNext', transactionCount: 2},
            };
        });

        it('prefers the expense-creating action over the pay action on the same transaction', () => {
            mockState.reportActionsCollection = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}rNext`]: {
                    payNext: makePayAction(NEXT_ID, {childReportID: 'payThreadNext', reportID: 'rNext'}),
                    actionNext: makeIOUAction(NEXT_ID, {childReportID: 'threadNext', reportID: 'rNext'}),
                },
            };

            renderNavigation();

            press('next-button');

            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'threadNext', anchorTransactionID: NEXT_ID}));
        });

        it('does not open the pay action thread when it is the only action on the transaction', () => {
            jest.mocked(getReportIDToOpenForExpense).mockReturnValue('rNext');
            mockState.reportActionsCollection = {
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}rNext`]: {payNext: makePayAction(NEXT_ID, {childReportID: 'payThreadNext', reportID: 'rNext'})},
            };

            renderNavigation();

            press('next-button');

            expect(Navigation.setParams).not.toHaveBeenCalledWith(expect.objectContaining({reportID: 'payThreadNext'}));
            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'rNext', anchorTransactionID: NEXT_ID}));
        });
    });

    /**
     * Regression guard for https://github.com/Expensify/App/issues/99612: an unreported (self-DM) sibling used to
     * fall through with no resolved target, and the resulting navigation dumped the user in their self-DM.
     */
    it('stays put rather than navigating to the unreported sentinel report', () => {
        jest.mocked(getReportIDToOpenForExpense).mockReturnValue(CONST.REPORT.UNREPORTED_REPORT_ID);
        mockState.transactionsCollection = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${CURRENT_ID}`]: {transactionID: CURRENT_ID, reportID: 'rCur'},
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${PREV_ID}`]: {transactionID: PREV_ID, reportID: CONST.REPORT.UNREPORTED_REPORT_ID},
            [`${ONYXKEYS.COLLECTION.TRANSACTION}${NEXT_ID}`]: {transactionID: NEXT_ID, reportID: CONST.REPORT.UNREPORTED_REPORT_ID},
        };

        renderNavigation();

        press('next-button');

        expect(Navigation.setParams).not.toHaveBeenCalled();
        expect(mockMarkReportRHPWidth).not.toHaveBeenCalled();
    });

    describe('clearing the carousel on unmount', () => {
        const setFocusedRoute = (name: string) => {
            mockGetRootState.mockReturnValue(makeRootState(name));
        };

        // Unmounting onto one of these means we're still inside the expense-navigation flow, and a screen lower in
        // the RHP stack may still depend on the carousel. In particular, opening the parent report from the
        // subtitle link pushes an EXPENSE_REPORT / SEARCH_MONEY_REQUEST_REPORT RHP on top of the transaction
        // thread, so backing out of an expense onto it must not wipe the underlying thread's carousel (#90366).
        it.each([
            ['SEARCH_REPORT', SCREENS.RIGHT_MODAL.SEARCH_REPORT],
            ['SEARCH_MONEY_REQUEST_REPORT', SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT],
            ['EXPENSE_REPORT', SCREENS.RIGHT_MODAL.EXPENSE_REPORT],
            ['TRANSACTION_DUPLICATE.DYNAMIC_REVIEW', SCREENS.TRANSACTION_DUPLICATE.DYNAMIC_REVIEW],
        ])('keeps the active transaction IDs when unmounting onto %s', (_label, screenName) => {
            setFocusedRoute(screenName);

            renderNavigation().unmount();

            expect(clearActiveTransactionIDs).not.toHaveBeenCalled();
        });

        it('clears the active transaction IDs when unmounting onto an unrelated screen', () => {
            setFocusedRoute(SCREENS.SEARCH.ROOT);

            renderNavigation().unmount();

            expect(clearActiveTransactionIDs).toHaveBeenCalled();
        });
    });
});
