import {act, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import IOURequestStartPage from '@pages/iou/request/IOURequestStartPage';

import type {IOURequestType, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = '1';
const TRANSACTION_ID = 'transaction1';
const CONFIRMATION_TEST_ID = 'EmbeddedConfirmation';
const LOADER_TEST_ID = 'manualTabPendingReset';
const AMOUNT_TEST_ID = 'EmbeddedAmount';
const CURRENT_USER_EMAIL = 'invoice.sender@example.com';

let mockGetHasUnsavedChanges: (() => boolean) | undefined;
let mockOnSignDirtyChange: ((isSignDirty: boolean) => void) | undefined;
let mockSuppressEmbeddedDiscardPrompt: (() => void) | undefined;
let mockOnTabSelected: ((tab: string) => void) | undefined;
let mockOnInputFocus: ((restoreFocus: () => void) => void) | undefined;
let mockOnInputBlur: (() => void) | undefined;
let mockOnCancel: (() => void) | undefined;
let mockOnVisibilityChange: ((isVisible: boolean) => void) | undefined;

jest.mock('@userActions/Tab');
jest.mock('@hooks/useDiscardChangesConfirmation', () => (options: {getHasUnsavedChanges: () => boolean; onCancel?: () => void; onVisibilityChange?: (isVisible: boolean) => void}) => {
    mockGetHasUnsavedChanges = options.getHasUnsavedChanges;
    mockOnCancel = options.onCancel;
    mockOnVisibilityChange = options.onVisibilityChange;
    return {suppressDiscardPrompt: jest.fn()};
});
jest.mock('@rnmapbox/maps', () => ({
    default: jest.fn(),
    MarkerView: jest.fn(),
    setAccessToken: jest.fn(),
}));

jest.mock('react-native-vision-camera', () => ({
    useCameraDevice: jest.fn(),
}));

// The page is rendered outside a navigator screen, so give the hooks that read the route a static one.
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useRoute: () => ({key: 'Money_Request_Create-1', name: 'Money_Request_Create', params: {}}),
    usePreventRemove: jest.fn(),
}));

// Render every tab screen inline so the manual tab content is mounted without driving the real tab navigator.
jest.mock('@libs/Navigation/OnyxTabNavigator', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    return {
        __esModule: true,
        default: ({children, onTabSelected}: {children: React.ReactNode; onTabSelected: (tab: string) => void}) => {
            mockOnTabSelected = onTabSelected;
            return ReactModule.createElement(ReactModule.Fragment, null, children);
        },
        TopTab: {
            Screen: ({children}: {children: () => React.ReactNode}) => ReactModule.createElement(ReactModule.Fragment, null, typeof children === 'function' ? children() : children),
        },
        TabScreenWithFocusTrapWrapper: ({children}: {children: React.ReactNode}) => ReactModule.createElement(ReactModule.Fragment, null, children),
    };
});

// The tabs we don't assert on are stubbed out - this suite only cares about which content the manual tab picks.
jest.mock('@pages/iou/request/step/IOURequestStepScan', () => () => null);
jest.mock('@pages/iou/request/step/IOURequestStepConfirmation', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<{View: React.ComponentType<{testID: string}>}>('react-native');
    const ConfirmationStub = ({
        onSignDirtyChange,
        suppressDiscardPrompt,
        onInputFocus,
        onInputBlur,
    }: {
        onSignDirtyChange?: (isSignDirty: boolean) => void;
        suppressDiscardPrompt?: () => void;
        onInputFocus?: (restoreFocus: () => void) => void;
        onInputBlur?: () => void;
    }) => {
        mockOnSignDirtyChange = onSignDirtyChange;
        mockSuppressEmbeddedDiscardPrompt = suppressDiscardPrompt;
        mockOnInputFocus = onInputFocus;
        mockOnInputBlur = onInputBlur;
        return ReactModule.createElement(View, {testID: 'EmbeddedConfirmation'});
    };
    return {
        __esModule: true,
        // The standalone RHP route, which brings its own ScreenWrapper.
        default: ConfirmationStub,
        // The bare body, which is what IOURequestStartPage composes into the trap it already owns.
        IOURequestStepConfirmationContentWithWritableReportOrNotFound: ConfirmationStub,
    };
});
jest.mock('@pages/iou/request/step/IOURequestStepAmount', () => {
    const ReactModule = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<{View: React.ComponentType<{testID: string}>}>('react-native');
    const AmountStub = () => ReactModule.createElement(View, {testID: 'EmbeddedAmount'});
    return {
        __esModule: true,
        default: AmountStub,
        IOURequestStepAmountWithTransactionOnly: AmountStub,
    };
});

describe('IOURequestStartPage manual tab content', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    afterEach(async () => {
        mockGetHasUnsavedChanges = undefined;
        mockOnSignDirtyChange = undefined;
        mockSuppressEmbeddedDiscardPrompt = undefined;
        mockOnTabSelected = undefined;
        mockOnInputFocus = undefined;
        mockOnInputBlur = undefined;
        mockOnCancel = undefined;
        mockOnVisibilityChange = undefined;
        await act(async () => {
            await Onyx.clear();
        });
    });

    type RenderStartPageOptions = {
        /** The request type the shared draft still carries when the page mounts. */
        iouRequestType: IOURequestType;

        /** The flow the page is started for - this is what decides whether tabs are rendered. */
        iouType?: IOUType;

        /** Initial transaction draft properties (e.g. isAmountSet, amount) */
        transactionDraft?: Partial<Transaction>;
    };

    /**
     * Seeds the manual tab selection and a draft transaction of the given request type, then renders the page.
     */
    async function renderStartPage({iouRequestType, iouType = CONST.IOU.TYPE.SUBMIT, transactionDraft}: RenderStartPageOptions) {
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.SELECTED_TAB}${CONST.TAB.IOU_REQUEST_TYPE}`, CONST.TAB_REQUEST.MANUAL);
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {
                transactionID: TRANSACTION_ID,
                iouRequestType,
                // Matching the route's reportID keeps useResetIOUType's focus effect from rebuilding the draft,
                // so the draft stays in the "not reset yet" state this test is about.
                reportID: REPORT_ID,
                ...transactionDraft,
            });
        });

        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <NavigationContainer>
                        <IOURequestStartPage
                            route={{
                                key: 'Money_Request_Create-1',
                                name: SCREENS.MONEY_REQUEST.CREATE,
                                // @ts-expect-error the create route types `backTo` and `action` as never, so its params can't be built here.
                                params: {iouType, reportID: REPORT_ID, transactionID: TRANSACTION_ID},
                            }}
                            report={undefined}
                            reportDraft={undefined}
                            // @ts-expect-error the page under test doesn't call into navigation.
                            navigation={undefined}
                            defaultSelectedTab={CONST.TAB_REQUEST.MANUAL}
                        />
                    </NavigationContainer>
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();
    }

    it('shows a loader instead of the embedded confirmation while a per diem draft is still pending its reset to manual', async () => {
        // Given the new manual expense flow beta and a draft that is still a per diem request
        await renderStartPage({iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM});

        // Then the manual tab waits for the reset instead of mounting the confirmation against the per diem draft
        expect(screen.getByTestId(LOADER_TEST_ID)).toBeOnTheScreen();
        expect(screen.queryByTestId(CONFIRMATION_TEST_ID)).not.toBeOnTheScreen();
    });

    it('shows a loader instead of the embedded confirmation while a scan draft is still pending its reset to manual', async () => {
        // Given the new manual expense flow beta and a draft that is still a scan request
        await renderStartPage({iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN});

        // Then the manual tab waits for the reset instead of mounting the confirmation against the scan draft
        expect(screen.getByTestId(LOADER_TEST_ID)).toBeOnTheScreen();
        expect(screen.queryByTestId(CONFIRMATION_TEST_ID)).not.toBeOnTheScreen();
    });

    it('shows the embedded confirmation once the draft is a manual request', async () => {
        // Given the new manual expense flow beta and a draft that has been reset to a manual request
        await renderStartPage({iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL});

        // Then the confirmation is mounted and the pending-reset loader is gone
        expect(screen.getByTestId(CONFIRMATION_TEST_ID)).toBeOnTheScreen();
        expect(screen.queryByTestId(LOADER_TEST_ID)).not.toBeOnTheScreen();
    });

    it('tracks embedded amount and sign changes for the discard guard', async () => {
        await renderStartPage({iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL});

        expect(mockGetHasUnsavedChanges?.()).toBe(false);

        act(() => {
            mockOnSignDirtyChange?.(true);
        });
        expect(mockGetHasUnsavedChanges?.()).toBe(true);

        act(() => {
            mockOnSignDirtyChange?.(false);
        });
        expect(mockGetHasUnsavedChanges?.()).toBe(false);

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {isAmountSet: true});
        });
        await waitForBatchedUpdatesWithAct();
        expect(mockGetHasUnsavedChanges?.()).toBe(true);

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {isAmountSet: false});
        });
        await waitForBatchedUpdatesWithAct();
        expect(mockGetHasUnsavedChanges?.()).toBe(false);
    });

    it('clears the embedded discard guard on tab switch and keeps it suppressed during submission', async () => {
        await renderStartPage({iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL});

        act(() => {
            mockOnSignDirtyChange?.(true);
        });
        expect(mockGetHasUnsavedChanges?.()).toBe(true);

        act(() => {
            mockOnTabSelected?.(CONST.TAB_REQUEST.SCAN);
        });
        expect(mockGetHasUnsavedChanges?.()).toBe(false);

        act(() => {
            mockOnSignDirtyChange?.(true);
            mockSuppressEmbeddedDiscardPrompt?.();
        });
        expect(mockGetHasUnsavedChanges?.()).toBe(false);

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {isAmountSet: true});
        });
        await waitForBatchedUpdatesWithAct();
        expect(mockGetHasUnsavedChanges?.()).toBe(false);
    });

    it('retains the discard guard on manual tab when mounting with a pre-existing draft amount (e.g. after page reload)', async () => {
        await renderStartPage({
            iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
            transactionDraft: {isAmountSet: true, amount: 1200},
        });

        expect(mockGetHasUnsavedChanges?.()).toBe(true);
    });

    it('keeps the discard guard clean on pay flow mount when pre-populated with an initial amount, but triggers when amount changes', async () => {
        await renderStartPage({
            iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL,
            iouType: CONST.IOU.TYPE.PAY,
            transactionDraft: {isAmountSet: true, amount: 5000},
        });

        expect(mockGetHasUnsavedChanges?.()).toBe(false);

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {amount: 4000});
        });
        await waitForBatchedUpdatesWithAct();
        expect(mockGetHasUnsavedChanges?.()).toBe(true);

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${TRANSACTION_ID}`, {amount: 5000});
        });
        await waitForBatchedUpdatesWithAct();
        expect(mockGetHasUnsavedChanges?.()).toBe(false);
    });

    it('lands the tab-less pay flow directly on the embedded confirmation instead of the amount page', async () => {
        // Given the new manual expense flow beta and a pay flow, which renders no tabs
        await renderStartPage({iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL, iouType: CONST.IOU.TYPE.PAY});

        // Then the details page is the landing page, so the amount page is never shown first
        expect(screen.getByTestId(CONFIRMATION_TEST_ID)).toBeOnTheScreen();
        expect(screen.queryByTestId(AMOUNT_TEST_ID)).not.toBeOnTheScreen();
    });

    it('does not strand the tab-less pay flow on the pending-reset loader when the draft is still a scan request', async () => {
        // Given a pay flow that mounts against a leftover scan draft from an earlier expense in the same chat
        await renderStartPage({iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN, iouType: CONST.IOU.TYPE.PAY});

        // Then the confirmation mounts anyway - the pay flow renders no tabs, so the reset the loader waits on never runs
        expect(screen.getByTestId(CONFIRMATION_TEST_ID)).toBeOnTheScreen();
        expect(screen.queryByTestId(LOADER_TEST_ID)).not.toBeOnTheScreen();
    });

    it('keeps the amount page as the landing page for the invoice flow', async () => {
        // Given an invoice flow, which is the one type left off the embedded confirmation
        await act(async () => {
            // AccessOrNotFoundWrapper gates the invoice flow behind an admin workspace that can send invoices.
            await Onyx.set(ONYXKEYS.SESSION, {email: CURRENT_USER_EMAIL, accountID: 1});
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}policy1`, {
                id: 'policy1',
                name: 'Invoice workspace',
                type: CONST.POLICY.TYPE.TEAM,
                role: CONST.POLICY.ROLE.ADMIN,
                areInvoicesEnabled: true,
            });
        });
        await renderStartPage({iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL, iouType: CONST.IOU.TYPE.INVOICE});

        // Then it still lands on the amount page first
        expect(screen.getByTestId(AMOUNT_TEST_ID)).toBeOnTheScreen();
        expect(screen.queryByTestId(CONFIRMATION_TEST_ID)).not.toBeOnTheScreen();
    });

    it('restores focus on discard cancellation only if an input was focused before modal opened', async () => {
        jest.useFakeTimers();
        await renderStartPage({iouRequestType: CONST.IOU.REQUEST_TYPE.MANUAL});

        const restoreFocusAmount = jest.fn();
        const restoreFocusDescription = jest.fn();

        // 1. Focus Amount
        act(() => {
            mockOnInputFocus?.(restoreFocusAmount);
        });

        // 2. Move to Description (Amount blurs, Description focuses)
        act(() => {
            mockOnInputBlur?.();
            mockOnInputFocus?.(restoreFocusDescription);
        });

        // 3. Move to a non-focusable item (Description blurs without new input focus)
        act(() => {
            mockOnInputBlur?.();
        });

        // Advance timers past blur debounce (100ms)
        act(() => {
            jest.advanceTimersByTime(150);
        });

        // Discard modal opens and user cancels
        act(() => {
            mockOnVisibilityChange?.(true);
            mockOnVisibilityChange?.(false);
            mockOnCancel?.();
            jest.advanceTimersByTime(CONST.ANIMATED_TRANSITION);
        });

        // Neither input should regain focus
        expect(restoreFocusAmount).not.toHaveBeenCalled();
        expect(restoreFocusDescription).not.toHaveBeenCalled();

        // 4. Focus Description again, then trigger discard modal immediately (e.g. back button tap)
        act(() => {
            mockOnInputFocus?.(restoreFocusDescription);
            mockOnInputBlur?.();
            mockOnVisibilityChange?.(true);
        });

        act(() => {
            jest.advanceTimersByTime(150);
            mockOnVisibilityChange?.(false);
            mockOnCancel?.();
            jest.advanceTimersByTime(CONST.ANIMATED_TRANSITION);
        });

        // Focus should be restored to Description
        expect(restoreFocusDescription).toHaveBeenCalledTimes(1);

        // 5. Switching tabs resets last focused input
        act(() => {
            mockOnInputFocus?.(restoreFocusDescription);
            mockOnTabSelected?.(CONST.TAB_REQUEST.SCAN);
            mockOnVisibilityChange?.(true);
            mockOnVisibilityChange?.(false);
            mockOnCancel?.();
            jest.advanceTimersByTime(CONST.ANIMATED_TRANSITION);
        });

        expect(restoreFocusDescription).toHaveBeenCalledTimes(1);

        jest.useRealTimers();
    });
});
