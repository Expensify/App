import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ReimbursementAccount} from '@src/types/onyx';
import type {ACHDataReimbursementAccount} from '@src/types/onyx/ReimbursementAccount';

import type {PartialDeep} from 'type-fest';

import createMock from './createMock';

const POLICY_ID = 'policy123';
const OTHER_POLICY_ID = 'policy456';
const BACK_TO = ROUTES.WORKSPACE_WORKFLOWS.getRoute(POLICY_ID);

/**
 * A pending USD account. Only the handful of fields the pages branch on are set; `createMock` keeps the partial
 * type-checked against the real ACH shape, so renaming one of those fields fails the build instead of silently
 * leaving the fixture describing an object production no longer emits.
 */
function buildAchData(overrides: PartialDeep<ACHDataReimbursementAccount, {recurseIntoArrays: true}> = {}) {
    return createMock<ACHDataReimbursementAccount>({
        policyID: POLICY_ID,
        state: CONST.BANK_ACCOUNT.STATE.PENDING,
        currentStep: CONST.BANK_ACCOUNT.STEP.VALIDATION,
        bankAccountID: 1234,
        currency: CONST.CURRENCY.USD,
        country: CONST.COUNTRY.US,
        ...overrides,
    });
}

const PENDING_ACCOUNT: ReimbursementAccount = {
    achData: buildAchData(),
    isLoading: false,
    shouldShowResetModal: false,
};

/**
 * The Navigation double both reimbursement-account suites assert against. `jest.mock` factories are hoisted above
 * imports, so each suite calls this from inside its own factory via `jest.requireActual` rather than importing it.
 */
function createNavigationMock() {
    return {
        navigate: jest.fn(),
        goBack: jest.fn(),
        dismissModal: jest.fn(),
        closeRHPFlow: jest.fn(),
        getActiveRoute: jest.fn(() => ''),
        getActiveRouteWithoutParams: jest.fn(() => ''),
        isNavigationReady: jest.fn(() => Promise.resolve()),
        isTopmostRouteModalScreen: jest.fn(() => false),
        setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback?.()),
        setParams: jest.fn(),
    };
}

export {BACK_TO, buildAchData, createNavigationMock, OTHER_POLICY_ID, PENDING_ACCOUNT, POLICY_ID};
