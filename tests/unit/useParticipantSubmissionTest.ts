import {act, renderHook} from '@testing-library/react-native';

import type {UseParticipantSubmissionParams} from '@hooks/useParticipantSubmission';
import useParticipantSubmission from '@hooks/useParticipantSubmission';

import Navigation from '@libs/Navigation/Navigation';
import {findSelfDMReportID} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {Participant} from '@src/types/onyx/IOU';

import createRandomTransaction from '../utils/collections/transaction';

// The confirmation page reaches the RHP by replacing the recipient picker, so goToNextStep must pass an explicit
// backTo for it to be able to navigate back to the picker. For the SUBMIT "Send to someone"/"Submit to a friend" flows
// this backTo is a reconstructed picker route anchored on the persistent self DM (SHARE still uses the active route).
// These tests lock that in by asserting on the route handed to Navigation.goBack, which is invisible in the rest of CI
// and only surfaces as the back button doing the wrong thing (the deploy blockers in #99145 and #99371).

const ACTIVE_ROUTE = 'r/R2/participants';

// Use the shared manual mock (src/libs/Navigation/__mocks__/Navigation.ts) rather than a hand-rolled factory. It
// already provides goBack, getActiveRoute, navigate, and a synchronous setNavigationActionToMicrotaskQueue.
jest.mock('@libs/Navigation/Navigation');

// Keep the real ReportUtils but make findSelfDMReportID controllable: goToNextStep anchors the reconstructed SUBMIT
// backTo on the self DM, so a test needs to pin that reportID to assert the picker route no longer points at the
// (soon-to-be non-writable) source report.
jest.mock('@libs/ReportUtils', () => {
    const actualReportUtils = jest.requireActual('@libs/ReportUtils');
    return {
        __esModule: true,
        ...actualReportUtils,
        findSelfDMReportID: jest.fn(() => undefined),
    };
});

jest.mock('@src/utils/keyboard', () => ({
    __esModule: true,
    default: {
        dismissKeyboardAndExecute: (callback: () => void) => callback(),
    },
}));

// Stub out the hook's data dependencies so the test can render it in isolation and focus purely on the backTo logic.
// Every Onyx read is stubbed to undefined here; goToNextStep's backTo path does not depend on Onyx data, but a future
// dependency added to that path would need a matching stub rather than silently reading undefined.
jest.mock('@hooks/useCommuterExclusionGuard', () => ({__esModule: true, default: () => () => false}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({getCurrencyDecimals: () => 2})}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({__esModule: true, default: () => ({accountID: 1, email: 'test@example.com', localCurrencyCode: 'USD'})}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key})}));
jest.mock('@hooks/useMappedPolicies', () => ({__esModule: true, default: () => [{}]}));
jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: () => [undefined]}));
jest.mock('@hooks/useOptimisticDraftTransactions', () => ({__esModule: true, default: () => [[]]}));
jest.mock('@hooks/usePersonalPolicy', () => ({__esModule: true, default: () => undefined}));
jest.mock('@hooks/usePolicyForMovingExpenses', () => ({__esModule: true, default: () => ({policyForMovingExpenses: undefined})}));
jest.mock('@hooks/useTransactionsByID', () => ({__esModule: true, default: () => [[]]}));

const mockGoBack = jest.mocked(Navigation.goBack);
const mockFindSelfDMReportID = jest.mocked(findSelfDMReportID);

const RECIPIENT: Participant = {accountID: 2, login: 'recipient@example.com', reportID: 'R2'};

function renderSubmission(overrides: Partial<UseParticipantSubmissionParams> = {}) {
    // Positive amount keeps the negative-expense-on-self-DM guard from short-circuiting goToNextStep.
    const initialTransaction = {...createRandomTransaction(1), transactionID: 'T1', amount: 100, currency: CONST.CURRENCY.USD, reportID: 'R1'};
    return renderHook(() =>
        useParticipantSubmission({
            reportID: 'R1',
            initialTransactionID: 'T1',
            initialTransaction,
            participants: [RECIPIENT],
            iouType: CONST.IOU.TYPE.SUBMIT,
            action: CONST.IOU.ACTION.SUBMIT,
            isSplitRequest: false,
            isMovingTransactionFromTrackExpense: true,
            isFocused: true,
            ...overrides,
        }),
    );
}

describe('useParticipantSubmission goToNextStep backTo', () => {
    beforeEach(() => {
        mockGoBack.mockClear();
        mockFindSelfDMReportID.mockReturnValue(undefined);
        jest.mocked(Navigation.getActiveRoute).mockReturnValue(ACTIVE_ROUTE);
    });

    it('passes an explicit backTo for the "Send to someone" flow (SUBMIT moving a tracked expense)', () => {
        const {result} = renderSubmission();

        act(() => {
            result.current.goToNextStep(undefined, [RECIPIENT]);
        });

        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockGoBack).toHaveBeenCalledWith(expect.stringContaining('backTo='), {compareParams: false});
    });

    it('anchors the SUBMIT backTo on the persistent self DM, not the tracked-expense source report (#99371)', () => {
        // The expense-header "Submit to a friend" flow opens the picker anchored on the tracked-expense's source report.
        // goToNextStep moves the transaction off that report, so the reconstructed backTo must instead point at the
        // writable self DM — otherwise pressing back on the confirmation page lands on the NotFound "Not here" page.
        mockFindSelfDMReportID.mockReturnValue('R3');
        const {result} = renderSubmission({reportID: 'R4'});

        act(() => {
            result.current.goToNextStep(undefined, [RECIPIENT]);
        });

        expect(mockGoBack).toHaveBeenCalledTimes(1);
        const backToRoute = mockGoBack.mock.calls.at(0)?.at(0);
        expect(backToRoute).toEqual(expect.stringContaining('backTo='));
        expect(backToRoute).toEqual(expect.stringContaining('R3'));
        expect(backToRoute).toEqual(expect.not.stringContaining('R4'));
    });

    it('passes an explicit backTo for the "Share with accountant" flow (SHARE moving a tracked expense)', () => {
        const {result} = renderSubmission({action: CONST.IOU.ACTION.SHARE});

        // SHARE clears participants on mount, so mirror the picker (onParticipantsAdded → onFinish) to register a
        // participant before proceeding; otherwise goToNextStep diverts to the create-workspace branch.
        act(() => {
            result.current.addParticipant([RECIPIENT]);
            result.current.goToNextStep(undefined, [RECIPIENT]);
        });

        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockGoBack).toHaveBeenCalledWith(expect.stringContaining('backTo='), {compareParams: false});
    });

    it('does not pass backTo for CATEGORIZE, which routes through the category step', () => {
        const {result} = renderSubmission({action: CONST.IOU.ACTION.CATEGORIZE});

        // CATEGORIZE also clears participants on mount; register one first so goToNextStep reaches the goBack path.
        act(() => {
            result.current.addParticipant([RECIPIENT]);
            result.current.goToNextStep(undefined, [RECIPIENT]);
        });

        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockGoBack).toHaveBeenCalledWith(expect.not.stringContaining('backTo='), {compareParams: false});
    });

    it('does not pass backTo for a global-create SUBMIT (not moving a tracked expense)', () => {
        const {result} = renderSubmission({action: CONST.IOU.ACTION.CREATE, isMovingTransactionFromTrackExpense: false});

        act(() => {
            result.current.goToNextStep(undefined, [RECIPIENT]);
        });

        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockGoBack).toHaveBeenCalledWith(expect.not.stringContaining('backTo='), {compareParams: false});
    });
});
