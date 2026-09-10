import {act, renderHook} from '@testing-library/react-native';

import type {UseParticipantSubmissionParams} from '@hooks/useParticipantSubmission';
import useParticipantSubmission from '@hooks/useParticipantSubmission';

import Navigation from '@libs/Navigation/Navigation';
// ReportUtils has only named exports, so a namespace import is required to jest.spyOn findSelfDMReportID (below).
// eslint-disable-next-line no-restricted-imports -- findSelfDMReportID is not a billing/paid-only helper; the rule only warns because the namespace also exposes isPaidGroupPolicy*, which this test never uses.
import * as ReportUtils from '@libs/ReportUtils';

import {setCustomUnitRateID} from '@userActions/IOU/MoneyRequest';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Transaction} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';

import type {OnyxCollection} from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createRandomTransaction, {createRandomDistanceRequestTransaction} from '../utils/collections/transaction';

// The confirmation page reaches the RHP by replacing the recipient picker, so goToNextStep must pass an explicit
// backTo for it to be able to navigate back to the picker. For the SUBMIT "Send to someone"/"Submit to a friend" flows
// this backTo is a reconstructed picker route anchored on the persistent self DM (SHARE still uses the active route).
// These tests lock that in by asserting on the route handed to Navigation.goBack, which is invisible in the rest of CI
// and only surfaces as the back button doing the wrong thing (the deploy blockers in #99145 and #99371).

// A realistic picker active route: the picker suffix is `expense-participants` (ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.path).
// goToNextStep snapshots Navigation.getActiveRoute() for SHARE and for the SUBMIT cold-start fallback, so this is the exact
// backTo those branches must produce.
const ACTIVE_ROUTE = 'r/R2/expense-participants';

// Use the shared manual mock (src/libs/Navigation/__mocks__/Navigation.ts) rather than a hand-rolled factory. It
// already provides goBack, getActiveRoute, navigate, and a synchronous setNavigationActionToMicrotaskQueue.
jest.mock('@libs/Navigation/Navigation');

jest.mock('@src/utils/keyboard', () => ({
    __esModule: true,
    default: {
        dismissKeyboardAndExecute: (callback: () => void) => callback(),
    },
}));

// `mock`-prefixed so the jest.mock factories below may close over them.
let mockPolicies: OnyxCollection<Policy> = {};
let mockDraftTransactions: Transaction[] = [];

// Stub out the hook's data dependencies so the test can render it in isolation and focus purely on the backTo logic.
// Every Onyx read is stubbed to undefined here; goToNextStep's backTo path does not depend on Onyx data, but a future
// dependency added to that path would need a matching stub rather than silently reading undefined.
jest.mock('@hooks/useBlockDistanceRequest', () => ({__esModule: true, default: () => () => false}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({getCurrencyDecimals: () => 2})}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({__esModule: true, default: () => ({accountID: 1, email: 'test@example.com', localCurrencyCode: 'USD'})}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key})}));
jest.mock('@hooks/useMappedPolicies', () => ({__esModule: true, default: () => [mockPolicies]}));
jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: () => [undefined]}));
jest.mock('@hooks/useOptimisticDraftTransactions', () => ({__esModule: true, default: () => [mockDraftTransactions]}));
jest.mock('@hooks/usePersonalPolicy', () => ({__esModule: true, default: () => undefined}));
jest.mock('@hooks/usePolicyForMovingExpenses', () => ({__esModule: true, default: () => ({policyForMovingExpenses: undefined})}));
jest.mock('@hooks/useTransactionsByID', () => ({__esModule: true, default: () => [[]]}));
jest.mock('@userActions/IOU/MoneyRequest', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/IOU/MoneyRequest'),
    setCustomUnitRateID: jest.fn(),
}));

const mockGoBack = jest.mocked(Navigation.goBack);
// Keep the real ReportUtils and spy only on findSelfDMReportID: goToNextStep anchors the reconstructed SUBMIT backTo on the
// self DM, so a test needs to pin that reportID to assert the picker route targets the writable self DM (or, when it resolves
// to undefined, to assert the cold-start fallback).
const mockFindSelfDMReportID = jest.spyOn(ReportUtils, 'findSelfDMReportID');

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
            isWorkspacesOnly: false,
            ...overrides,
        }),
    );
}

// goBack is called with the confirmation route; the picker route lives in its `backTo` query param. Extract and decode it
// so tests can assert the exact route the back button will resolve to (a substring match would pass even if the route lost
// isWorkspacesOnly, pointed at the wrong suffix, or matched a longer reportID like R30).
function getBackToParam(): string | null {
    const confirmationRoute = mockGoBack.mock.calls.at(0)?.[0];
    if (!confirmationRoute) {
        return null;
    }
    const query = confirmationRoute.split('?').slice(1).join('?');
    return new URLSearchParams(query).get('backTo');
}

describe('useParticipantSubmission goToNextStep backTo', () => {
    beforeEach(() => {
        mockGoBack.mockClear();
        mockFindSelfDMReportID.mockReturnValue(undefined);
        jest.mocked(Navigation.getActiveRoute).mockReturnValue(ACTIVE_ROUTE);
    });

    it('anchors the SUBMIT picker guard on the self DM while keeping the source report as the base path (#99371, codex P2)', () => {
        // The expense-header "Submit to a friend" flow opens the picker anchored on the tracked-expense's source report (R4).
        // goToNextStep moves the transaction off that report, so the reconstructed backTo's picker reportID must instead point
        // at the writable self DM (R3). Otherwise pressing back on the confirmation page lands on the NotFound "Not here" page.
        // The central-pane base path must stay the source report (R4) so back does not swap the visible report out from under
        // the user.
        mockFindSelfDMReportID.mockReturnValue('R3');
        const {result} = renderSubmission({reportID: 'R4'});

        act(() => {
            result.current.goToNextStep(undefined, [RECIPIENT]);
        });

        expect(mockGoBack).toHaveBeenCalledTimes(1);
        // Full route: base path stays the visible report (R4), the picker's writable-report guard (reportID param) targets the
        // self DM (R3), and the picker suffix is `expense-participants`.
        expect(getBackToParam()).toBe('r/R4/expense-participants?action=submit&iouType=submit&transactionID=T1&reportID=R3');
    });

    it('carries isWorkspacesOnly into the reconstructed SUBMIT backTo so the employer picker stays workspaces-only on back (codex P1)', () => {
        // "Submit to my employer" with multiple workspaces opens the picker with isWorkspacesOnly=true. A positive tracked
        // expense cannot re-infer that restriction, so the reconstructed backTo must carry the flag or back shows individuals.
        mockFindSelfDMReportID.mockReturnValue('R3');
        const {result} = renderSubmission({reportID: 'R4', isWorkspacesOnly: true});

        act(() => {
            result.current.goToNextStep(undefined, [RECIPIENT]);
        });

        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(getBackToParam()).toBe('r/R4/expense-participants?action=submit&iouType=submit&transactionID=T1&reportID=R3&isWorkspacesOnly=true');
    });

    it('falls back to the active route for the SUBMIT picker when the self DM cannot be resolved (cold start)', () => {
        // On a cold start findSelfDMReportID returns undefined (Onyx not hydrated), so the reconstructed route cannot anchor its
        // writable-report guard on the self DM. Rather than guess a route the PR argues is unsafe, goToNextStep falls back to the
        // current picker URL (Navigation.getActiveRoute()) — the pre-#99371 behavior. selfDM is left undefined by beforeEach.
        const {result} = renderSubmission({reportID: 'R4'});

        act(() => {
            result.current.goToNextStep(undefined, [RECIPIENT]);
        });

        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(getBackToParam()).toBe(ACTIVE_ROUTE);
    });

    it('passes the active route as backTo for the "Share with accountant" flow (SHARE moving a tracked expense)', () => {
        // SHARE routes back through the accountant step, not the participant picker, so it uses the active route as-is.
        mockFindSelfDMReportID.mockReturnValue('R3');
        const {result} = renderSubmission({action: CONST.IOU.ACTION.SHARE});

        // SHARE clears participants on mount, so mirror the picker (onParticipantsAdded → onFinish) to register a
        // participant before proceeding; otherwise goToNextStep diverts to the create-workspace branch.
        act(() => {
            result.current.addParticipant([RECIPIENT]);
            result.current.goToNextStep(undefined, [RECIPIENT]);
        });

        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(getBackToParam()).toBe(ACTIVE_ROUTE);
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

const WORKSPACE_RATE_ID = 'RATE_DESTINATION';
const OTHER_WORKSPACE_RATE_ID = 'RATE_SOURCE';
const DESTINATION_POLICY_ID = 'WS_DESTINATION';

const DESTINATION_CHAT: Participant = {reportID: 'R3', policyID: DESTINATION_POLICY_ID, isPolicyExpenseChat: true};

function buildDestinationPolicy(): Policy {
    return {
        ...createRandomPolicy(1),
        id: DESTINATION_POLICY_ID,
        customUnits: {
            distance: {
                customUnitID: 'distance',
                name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                rates: {
                    [WORKSPACE_RATE_ID]: {
                        customUnitRateID: WORKSPACE_RATE_ID,
                        name: 'Default Rate',
                        rate: 70,
                        currency: CONST.CURRENCY.USD,
                        enabled: true,
                    },
                },
            },
        },
    };
}

function buildTrackedDistanceDraft(customUnitRateID: string | undefined): Transaction {
    return {
        ...createRandomDistanceRequestTransaction(2),
        transactionID: 'T1',
        amount: 210917,
        currency: CONST.CURRENCY.USD,
        created: '2026-08-14',
        // quantity is 0 while the map route is still being generated.
        comment: {customUnit: {customUnitRateID, distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES, quantity: 0}},
    };
}

describe('useParticipantSubmission addParticipant distance rate', () => {
    beforeEach(() => {
        jest.mocked(setCustomUnitRateID).mockClear();
        mockPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}${DESTINATION_POLICY_ID}`]: buildDestinationPolicy()};
    });

    afterEach(() => {
        mockPolicies = {};
        mockDraftTransactions = [];
    });

    it("selects the destination workspace's rate when the tracked expense carries another workspace's rate", () => {
        mockDraftTransactions = [buildTrackedDistanceDraft(OTHER_WORKSPACE_RATE_ID)];
        const {result} = renderSubmission();

        act(() => {
            result.current.addParticipant([DESTINATION_CHAT]);
        });

        expect(setCustomUnitRateID).toHaveBeenCalledTimes(1);
        expect(jest.mocked(setCustomUnitRateID).mock.calls.at(0)?.at(1)).toBe(WORKSPACE_RATE_ID);
    });

    it("selects the destination workspace's rate when the tracked expense draft has no rate ID yet", () => {
        mockDraftTransactions = [buildTrackedDistanceDraft(undefined)];
        const {result} = renderSubmission();

        act(() => {
            result.current.addParticipant([DESTINATION_CHAT]);
        });

        expect(setCustomUnitRateID).toHaveBeenCalledTimes(1);
        expect(jest.mocked(setCustomUnitRateID).mock.calls.at(0)?.at(1)).toBe(WORKSPACE_RATE_ID);
    });

    it.each([
        ['per diem', CONST.IOU.REQUEST_TYPE.PER_DIEM, 'PER_DIEM_RATE'],
        ['time', CONST.IOU.REQUEST_TYPE.TIME, undefined],
    ])('leaves a tracked %s expense rate alone', (_name, iouRequestType, rateID) => {
        mockDraftTransactions = [{...buildTrackedDistanceDraft(rateID), iouRequestType}];
        const {result} = renderSubmission();

        act(() => {
            result.current.addParticipant([DESTINATION_CHAT]);
        });

        expect(setCustomUnitRateID).not.toHaveBeenCalled();
    });

    it('keeps the p2p rate so the confirmation step can ask the user to pick a workspace rate', () => {
        mockDraftTransactions = [buildTrackedDistanceDraft(CONST.CUSTOM_UNITS.FAKE_P2P_ID)];
        const {result} = renderSubmission();

        act(() => {
            result.current.addParticipant([DESTINATION_CHAT]);
        });

        expect(setCustomUnitRateID).not.toHaveBeenCalled();
    });

    it('leaves the rate alone when the destination workspace has no rates loaded yet', () => {
        mockPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}${DESTINATION_POLICY_ID}`]: {...createRandomPolicy(2), id: DESTINATION_POLICY_ID}};
        mockDraftTransactions = [buildTrackedDistanceDraft(OTHER_WORKSPACE_RATE_ID)];
        const {result} = renderSubmission();

        act(() => {
            result.current.addParticipant([DESTINATION_CHAT]);
        });

        expect(setCustomUnitRateID).not.toHaveBeenCalled();
    });

    it('leaves the rate alone when every rate on the destination workspace is disabled', () => {
        const policy = buildDestinationPolicy();
        const distanceUnit = policy.customUnits?.distance;
        if (distanceUnit?.rates[WORKSPACE_RATE_ID]) {
            distanceUnit.rates[WORKSPACE_RATE_ID].enabled = false;
        }
        mockPolicies = {[`${ONYXKEYS.COLLECTION.POLICY}${DESTINATION_POLICY_ID}`]: policy};
        mockDraftTransactions = [buildTrackedDistanceDraft(OTHER_WORKSPACE_RATE_ID)];
        const {result} = renderSubmission();

        act(() => {
            result.current.addParticipant([DESTINATION_CHAT]);
        });

        expect(setCustomUnitRateID).not.toHaveBeenCalled();
    });

    it('leaves a rate the destination workspace already owns alone', () => {
        mockDraftTransactions = [buildTrackedDistanceDraft(WORKSPACE_RATE_ID)];
        const {result} = renderSubmission();

        act(() => {
            result.current.addParticipant([DESTINATION_CHAT]);
        });

        expect(setCustomUnitRateID).not.toHaveBeenCalled();
    });
});
