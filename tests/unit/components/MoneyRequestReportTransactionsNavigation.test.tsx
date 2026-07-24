import {fireEvent, render, screen} from '@testing-library/react-native';

import MoneyRequestReportTransactionsNavigation from '@components/MoneyRequestReportView/MoneyRequestReportTransactionsNavigation';

import {createTransactionThreadReport} from '@libs/actions/Report';
import {getReportIDToOpenForExpense} from '@libs/TransactionThreadNavigationUtils';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

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
    default: () => ({translate: (key: string) => key}),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 1, email: 'me@example.com'}),
}));

jest.mock('@components/WideRHPContextProvider', () => ({
    useWideRHPActions: () => ({markReportRHPWidth: mockMarkReportRHPWidth}),
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

jest.mock('@navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        getRootState: jest.fn(() => ({index: 0, routes: [{key: 'k', name: 'testRoute'}]})),
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

            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'rNext', reportActionID: undefined}));
            expect(mockMarkReportRHPWidth).toHaveBeenCalledWith('rNext', 'wide');
        });

        it('navigates previous to the parent reportID', () => {
            renderNavigation();

            press('prev-button');

            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'rPrev', reportActionID: undefined}));
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

            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'rNext'}));
        });

        it('navigates previous using snapshot-only data', () => {
            renderNavigation();

            press('prev-button');

            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'rPrev'}));
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

            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'threadNext'}));
            expect(mockMarkReportRHPWidth).toHaveBeenCalledWith('threadNext', 'wide');
        });

        it('navigates previous to the existing transaction thread reportID', () => {
            renderNavigation();

            press('prev-button');

            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'threadPrev'}));
            expect(mockMarkReportRHPWidth).toHaveBeenCalledWith('threadPrev', 'wide');
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

        it('creates a thread and navigates next, anchoring on the target transaction', () => {
            renderNavigation();

            press('next-button');

            expect(createTransactionThreadReport).toHaveBeenCalled();
            // createTransactionThreadReport is mocked to return undefined, so the target falls back to the transaction's own reportID.
            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'rNext', anchorTransactionID: NEXT_ID}));
        });

        it('creates a thread and navigates previous, anchoring on the target transaction', () => {
            renderNavigation();

            press('prev-button');

            expect(createTransactionThreadReport).toHaveBeenCalled();
            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'rPrev', anchorTransactionID: PREV_ID}));
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
            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'descNext'}));
        });

        it('navigates previous to the descriptor-resolved reportID', () => {
            jest.mocked(getReportIDToOpenForExpense).mockReturnValue('descPrev');
            renderNavigation();

            press('prev-button');

            expect(getReportIDToOpenForExpense).toHaveBeenCalled();
            expect(Navigation.setParams).toHaveBeenCalledWith(expect.objectContaining({reportID: 'descPrev'}));
        });
    });

    it('does not render navigation when there are fewer than two transactions', () => {
        mockState.transactionIDsList = [CURRENT_ID];

        renderNavigation();

        expect(screen.queryByTestId('next-button')).toBeNull();
    });
});
