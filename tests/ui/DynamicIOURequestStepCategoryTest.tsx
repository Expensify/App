import {render} from '@testing-library/react-native';

import CategoryPicker from '@components/CategoryPicker';

import type usePolicy from '@hooks/usePolicy';

import Navigation from '@libs/Navigation/Navigation';

import DynamicIOURequestStepCategory from '@pages/iou/request/step/DynamicIOURequestStepCategory';
import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {PolicyCategories} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = '1';
const REPORT_ID = 'report-1';
const TRANSACTION_ID = 'txn-1';
const BACK_PATH = 'r/report-1';

const mockPolicy = {...createRandomPolicy(Number(POLICY_ID)), id: POLICY_ID, type: CONST.POLICY.TYPE.CORPORATE, areCategoriesEnabled: true};

// The "OrNotFound" HOCs load the report and transaction from Onyx and gate rendering on them. Here they hand over fixed ones.
const mockReport = {reportID: REPORT_ID, policyID: POLICY_ID};
const mockTransaction = {transactionID: TRANSACTION_ID, reportID: REPORT_ID};
jest.mock('@pages/iou/request/step/withWritableReportOrNotFound', () => (Component: React.ComponentType<Record<string, unknown>>) => (props: Record<string, unknown>) => (
    <Component
        {...props}
        report={mockReport}
    />
));
jest.mock('@pages/iou/request/step/withFullTransactionOrNotFound', () => (Component: React.ComponentType<Record<string, unknown>>) => (props: Record<string, unknown>) => (
    <Component
        {...props}
        transaction={mockTransaction}
    />
));
jest.mock('@pages/iou/request/step/StepScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));

// The picker is replaced so the test can tap the create row by calling the handler the page passes it.
jest.mock('@components/CategoryPicker', () => jest.fn(() => null));

const mockCreateAndApplyCategory = jest.fn();
jest.mock('@hooks/useCreateAndApplyCategory', () => () => mockCreateAndApplyCategory);

// `isDraftUpdate` is true for an expense that is still being created, which is the case the CATEGORIZE branch checks.
jest.mock('@hooks/useUpdateTransactionCategory', () => () => ({updateCategory: jest.fn(), isDraftUpdate: true}));
jest.mock('@hooks/usePolicyForTransaction', () => () => ({policy: mockPolicy}));
jest.mock('@hooks/usePolicyForMovingExpenses', () => () => ({policyForMovingExpenses: undefined}));
jest.mock('@hooks/usePolicyData', () => {
    const {default: useRealPolicy} = jest.requireActual<{default: typeof usePolicy}>('@hooks/usePolicy');
    return (policyID?: string) => ({policy: useRealPolicy(policyID)});
});
jest.mock('@hooks/useDynamicBackPath', () => () => BACK_PATH);
jest.mock('@hooks/useShowNotFoundPageInIOUStep', () => () => false);
jest.mock('@hooks/useRestartOnReceiptFailure', () => () => {});
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({}),
    useMemoizedLazyIllustrations: () => ({}),
}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

// Only an admin sees the create row, so the test stands in for one.
jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/PolicyUtils'),
    canCreateCategoryInSitu: () => true,
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));

const makeCategory = (name: string): PolicyCategories[string] => ({
    name,
    enabled: true,
    unencodedName: name,
    areCommentsRequired: false,
    externalID: '',
    origin: '',
    pendingAction: undefined,
});

const renderPage = (action: typeof CONST.IOU.ACTION.CATEGORIZE | typeof CONST.IOU.ACTION.CREATE) =>
    render(
        <DynamicIOURequestStepCategory
            {...createMock<React.ComponentProps<typeof DynamicIOURequestStepCategory>>({
                route: {
                    key: 'Dynamic_Money_Request_Step_Category-test',
                    name: SCREENS.MONEY_REQUEST.DYNAMIC_STEP_CATEGORY,
                    params: {action, iouType: CONST.IOU.TYPE.SUBMIT, transactionID: TRANSACTION_ID, reportID: REPORT_ID},
                },
            })}
        />,
    );

const tapCreateRow = (categoryName: string) => {
    const onCreateCategory = jest.mocked(CategoryPicker).mock.lastCall?.[0].onCreateCategory;
    if (!onCreateCategory) {
        throw new Error('Expected the page to offer the create row');
    }
    onCreateCategory(categoryName);
};

describe('DynamicIOURequestStepCategory create row', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${POLICY_ID}`, {Meals: makeCategory('Meals')});
    });

    it('goes forward to Confirmation after the create row is tapped while categorizing a tracked expense', async () => {
        // Given an admin categorizing a tracked expense, which opens the category step before Confirmation exists
        renderPage(CONST.IOU.ACTION.CATEGORIZE);
        await waitForBatchedUpdatesWithAct();

        // When they tap the create row for a search that matched nothing
        tapCreateRow('Training');

        // Then the category is created and applied, and the flow moves on to Confirmation as it does after a normal pick,
        // because there is no Confirmation screen behind this one to go back to
        expect(mockCreateAndApplyCategory).toHaveBeenCalledWith('Training');
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CATEGORIZE, CONST.IOU.TYPE.SUBMIT, TRANSACTION_ID, REPORT_ID));
        expect(Navigation.goBack).not.toHaveBeenCalled();
    });

    it('goes back after the create row is tapped while creating an expense', async () => {
        // Given an admin who opened the category step from an expense they are creating
        renderPage(CONST.IOU.ACTION.CREATE);
        await waitForBatchedUpdatesWithAct();

        // When they tap the create row for a search that matched nothing
        tapCreateRow('Training');

        // Then the category is created and applied, and they go back to the page they came from
        expect(mockCreateAndApplyCategory).toHaveBeenCalledWith('Training');
        expect(Navigation.goBack).toHaveBeenCalledWith(BACK_PATH, {shouldSkipFocusRestore: true});
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it.each([CONST.IOU.ACTION.CREATE, CONST.IOU.ACTION.CATEGORIZE])('hides only the create row for a draft-only workspace during %s', async (action) => {
        // Given a workspace that exists only as a draft, including Categorize's draft workspace
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, null);
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${POLICY_ID}`, {...mockPolicy, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});

        // When its category step opens
        renderPage(action);
        await waitForBatchedUpdatesWithAct();

        // Then inline creation is hidden but the existing add-category menu is unchanged
        expect(jest.mocked(CategoryPicker).mock.lastCall?.[0].onCreateCategory).toBeUndefined();
        expect(jest.mocked(StepScreenWrapper).mock.lastCall?.[0].threeDotsMenuItems).toHaveLength(1);
        expect(mockCreateAndApplyCategory).not.toHaveBeenCalled();
    });

    it('keeps the create row for a real workspace created optimistically while offline', async () => {
        // Given a real workspace whose creation is still pending while offline
        await Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});

        // When the user creates the searched-for category
        renderPage(CONST.IOU.ACTION.CREATE);
        await waitForBatchedUpdatesWithAct();
        tapCreateRow('Training');

        // Then pending workspace creation does not block inline category creation
        expect(mockCreateAndApplyCategory).toHaveBeenCalledWith('Training');
        expect(jest.mocked(StepScreenWrapper).mock.lastCall?.[0].threeDotsMenuItems).toHaveLength(1);
    });
});
