import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SearchFiltersBarCreateButton from '@components/Search/SearchPageHeader/SearchFiltersBarCreateButton';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import {createNewReport} from '@libs/actions/Report';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((cb: () => void) => cb()),
    getActiveRoute: jest.fn(() => ''),
    isTopmostRouteModalScreen: jest.fn(() => false),
}));

jest.mock('@libs/actions/Report', () => ({
    createNewReport: jest.fn(() => ({reportID: 'mock-report-id'})),
}));

jest.mock('@libs/interceptAnonymousUser', () => jest.fn((callback: () => void) => callback()));

jest.mock('@libs/actions/IOU', () => ({
    startMoneyRequest: jest.fn(),
    startDistanceRequest: jest.fn(),
}));

jest.mock('@libs/actions/Link', () => ({
    openOldDotLink: jest.fn(),
}));

jest.mock('@hooks/usePolicyForMovingExpenses');

jest.mock('@hooks/usePopoverPosition', () => () => ({
    calculatePopoverPosition: jest.fn(() => Promise.resolve({horizontal: 0, vertical: 0})),
}));

jest.mock('@hooks/useHasEmptyReportsForPolicy', () => () => false);

jest.mock('@hooks/useCreateEmptyReportConfirmation', () => () => ({
    openCreateReportConfirmation: jest.fn(),
    CreateReportConfirmationModal: null,
}));

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => () => true);

const mockUsePolicyForMovingExpenses = jest.mocked(usePolicyForMovingExpenses);
const mockNavigate = jest.mocked(Navigation.navigate);
const mockCreateNewReport = jest.mocked(createNewReport);
const mockInterceptAnonymousUser = jest.mocked(interceptAnonymousUser);

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'user@test.com';

const MOCK_POLICY_ID = 'policy-123';
const MOCK_POLICY = {
    id: MOCK_POLICY_ID,
    name: 'Test Workspace',
    type: CONST.POLICY.TYPE.TEAM,
    role: CONST.POLICY.ROLE.ADMIN,
    isPolicyExpenseChatEnabled: true,
    pendingAction: null,
    avatarURL: '',
    areInvoicesEnabled: false,
    owner: CURRENT_USER_EMAIL,
    outputCurrency: CONST.CURRENCY.USD,
};

function renderComponent() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <SearchFiltersBarCreateButton />
        </ComposeProviders>,
    );
}

// Helper function to create mock events for PopoverMenuItem fireEvent.press
function createMockPressEvent(target: unknown) {
    return {
        nativeEvent: {},
        type: 'press',
        target,
        currentTarget: target,
    };
}

describe('SearchFiltersBarCreateButton', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        mockUsePolicyForMovingExpenses.mockReturnValue({
            policyForMovingExpensesID: undefined,
            policyForMovingExpenses: undefined,
            shouldSelectPolicy: false,
        });

        await act(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {
                accountID: CURRENT_USER_ACCOUNT_ID,
                email: CURRENT_USER_EMAIL,
            });
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    it('should always show the "Create report" menu item', async () => {
        // When component is rendered
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        // When Create button is pressed to open menu
        const createButton = screen.getByText(translateLocal('common.create'));
        fireEvent.press(createButton);
        await waitForBatchedUpdatesWithAct();

        // Then "Create report" option is visible
        expect(screen.getByText(translateLocal('report.newReport.createReport'))).toBeOnTheScreen();
    });

    it('should navigate to upgrade path when no valid policy exists', async () => {
        // Given no policies exist (shouldNavigateToUpgradePath = true)

        // When component is rendered
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        // When Create button is pressed to open menu
        const createButton = screen.getByText(translateLocal('common.create'));
        fireEvent.press(createButton);
        await waitForBatchedUpdatesWithAct();

        // When "Create report" is pressed
        const createReportItem = screen.getByText(translateLocal('report.newReport.createReport'));
        fireEvent.press(createReportItem, createMockPressEvent(createReportItem));
        await waitForBatchedUpdatesWithAct();

        // Then it navigates to the upgrade path
        expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('upgrade'));
    });

    it('should navigate to workspace selector when no default policy and multiple workspaces exist', async () => {
        // Given user has multiple policies (shouldSelectPolicy = true, but no single default)
        mockUsePolicyForMovingExpenses.mockReturnValue({
            policyForMovingExpensesID: 'some-policy',
            policyForMovingExpenses: MOCK_POLICY,
            shouldSelectPolicy: false,
        });

        // Set up multiple policies with chat enabled
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`, MOCK_POLICY);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy-456`, {
                ...MOCK_POLICY,
                id: 'policy-456',
                name: 'Second Workspace',
            });
        });
        await waitForBatchedUpdatesWithAct();

        // When component is rendered
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        // When Create button is pressed to open menu
        const createButton = screen.getByText(translateLocal('common.create'));
        fireEvent.press(createButton);
        await waitForBatchedUpdatesWithAct();

        // When "Create report" is pressed
        const createReportItem = screen.getByText(translateLocal('report.newReport.createReport'));
        fireEvent.press(createReportItem, createMockPressEvent(createReportItem));
        await waitForBatchedUpdatesWithAct();

        // Then it navigates to workspace selection
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
    });

    it('should create report directly when a single default workspace exists', async () => {
        // Given user has a single valid policy
        mockUsePolicyForMovingExpenses.mockReturnValue({
            policyForMovingExpensesID: MOCK_POLICY_ID,
            policyForMovingExpenses: MOCK_POLICY,
            shouldSelectPolicy: false,
        });

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${MOCK_POLICY_ID}`, MOCK_POLICY);
            await Onyx.merge(ONYXKEYS.NVP_ACTIVE_POLICY_ID, MOCK_POLICY_ID);
        });
        await waitForBatchedUpdatesWithAct();

        // When component is rendered
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        // When Create button is pressed to open menu
        const createButton = screen.getByText(translateLocal('common.create'));
        fireEvent.press(createButton);
        await waitForBatchedUpdatesWithAct();

        // When "Create report" is pressed
        const createReportItem = screen.getByText(translateLocal('report.newReport.createReport'));
        fireEvent.press(createReportItem, createMockPressEvent(createReportItem));
        await waitForBatchedUpdatesWithAct();

        // Then createNewReport is called to create the report directly
        expect(mockCreateNewReport).toHaveBeenCalled();
    });

    it('should call interceptAnonymousUser when "Create report" is pressed', async () => {
        // Given component is rendered
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        // When Create button is pressed to open menu
        const createButton = screen.getByText(translateLocal('common.create'));
        fireEvent.press(createButton);
        await waitForBatchedUpdatesWithAct();

        // When "Create report" is pressed
        const createReportItem = screen.getByText(translateLocal('report.newReport.createReport'));
        fireEvent.press(createReportItem, createMockPressEvent(createReportItem));
        await waitForBatchedUpdatesWithAct();

        // Then interceptAnonymousUser is called
        expect(mockInterceptAnonymousUser).toHaveBeenCalled();
    });

    it('should also show "Create expense" and "Track distance" menu items', async () => {
        // When component is rendered
        renderComponent();
        await waitForBatchedUpdatesWithAct();

        // When Create button is pressed to open menu
        const createButton = screen.getByText(translateLocal('common.create'));
        fireEvent.press(createButton);
        await waitForBatchedUpdatesWithAct();

        // Then all three menu items are visible
        expect(screen.getByText(translateLocal('iou.createExpense'))).toBeOnTheScreen();
        expect(screen.getByText(translateLocal('iou.trackDistance'))).toBeOnTheScreen();
        expect(screen.getByText(translateLocal('report.newReport.createReport'))).toBeOnTheScreen();
    });
});
