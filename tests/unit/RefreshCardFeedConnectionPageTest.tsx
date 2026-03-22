import {act, cleanup, render, screen} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';
import {clearAssignCardStepAndData, setFeedRefreshComplete} from '@libs/actions/CompanyCards';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Bypass the HOC and render the inner component directly
jest.mock('@pages/workspace/withPolicyAndFullscreenLoading', () => (Component: React.ComponentType) => Component);

const mockCloseRHPFlow = jest.fn();

jest.mock('@hooks/useCardFeeds', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@pages/workspace/companyCards/BankConnection', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    // eslint-disable-next-line react/display-name
    default: () => <View testID="BankConnection" />,
}));

jest.mock('@pages/workspace/companyCards/addNew/PlaidConnectionStep', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    // eslint-disable-next-line react/display-name
    default: () => <View testID="PlaidConnectionStep" />,
}));

jest.mock('@pages/LoadingPage', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    // eslint-disable-next-line react/display-name
    default: () => <View testID="LoadingPage" />,
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    closeRHPFlow: mockCloseRHPFlow,
    navigate: jest.fn(),
    goBack: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn(),
}));

jest.mock('@libs/actions/CompanyCards', () => ({
    clearAssignCardStepAndData: jest.fn(),
    setFeedRefreshComplete: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access
const useCardFeeds = require('@hooks/useCardFeeds').default as jest.Mock;
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const RefreshCardFeedConnectionPage = require('@pages/workspace/companyCards/RefreshCardFeedConnectionPage').default;

const MOCK_FEED = 'oauth.chase_bank_card_99999' as const;
const MOCK_POLICY = {id: 'policy1'};
const MOCK_ROUTE = {params: {feed: MOCK_FEED}};

describe('RefreshCardFeedConnectionPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        cleanup();
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
    });

    beforeEach(() => {
        useCardFeeds.mockReturnValue([{[MOCK_FEED]: {expiration: '2024-01-01'}}, {status: 'loaded'}]);
    });

    it('renders LoadingPage while currentStep is not set', async () => {
        render(
            <RefreshCardFeedConnectionPage
                policy={MOCK_POLICY}
                route={MOCK_ROUTE}
            />,
        );
        await act(async () => {
            await waitForBatchedUpdates();
        });

        expect(screen.getByTestId('LoadingPage')).toBeTruthy();
        expect(screen.queryByTestId('BankConnection')).toBeNull();
    });

    it('renders BankConnection when currentStep is BANK_CONNECTION', async () => {
        await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
            currentStep: CONST.COMPANY_CARD.STEP.BANK_CONNECTION,
            isRefreshing: true,
        });

        render(
            <RefreshCardFeedConnectionPage
                policy={MOCK_POLICY}
                route={MOCK_ROUTE}
            />,
        );
        await act(async () => {
            await waitForBatchedUpdates();
        });

        expect(screen.getByTestId('BankConnection')).toBeTruthy();
    });

    it('renders PlaidConnectionStep when currentStep is PLAID_CONNECTION', async () => {
        await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
            currentStep: CONST.COMPANY_CARD.STEP.PLAID_CONNECTION,
            isRefreshing: true,
        });

        render(
            <RefreshCardFeedConnectionPage
                policy={MOCK_POLICY}
                route={MOCK_ROUTE}
            />,
        );
        await act(async () => {
            await waitForBatchedUpdates();
        });

        expect(screen.getByTestId('PlaidConnectionStep')).toBeTruthy();
    });

    it('closes RHP flow when Plaid isRefreshing clears after successful import', async () => {
        await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
            currentStep: CONST.COMPANY_CARD.STEP.PLAID_CONNECTION,
            isRefreshing: true,
        });

        render(
            <RefreshCardFeedConnectionPage
                policy={MOCK_POLICY}
                route={MOCK_ROUTE}
            />,
        );
        await act(async () => {
            await waitForBatchedUpdates();
        });

        // Simulate importPlaidAccounts successData clearing isRefreshing (Plaid path)
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {isRefreshing: null});
            await waitForBatchedUpdates();
        });

        expect(mockCloseRHPFlow).toHaveBeenCalledTimes(1);
    });

    it('calls setFeedRefreshComplete when OAuth feed expiration updates while refreshing', async () => {
        await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
            currentStep: CONST.COMPANY_CARD.STEP.BANK_CONNECTION,
            isRefreshing: true,
        });

        const {rerender} = render(
            <RefreshCardFeedConnectionPage
                policy={MOCK_POLICY}
                route={MOCK_ROUTE}
            />,
        );
        await act(async () => {
            await waitForBatchedUpdates();
        });

        // Simulate bank re-authentication updating the feed expiration (OAuth path).
        // Re-render is needed to propagate the new mock return value.
        useCardFeeds.mockReturnValue([{[MOCK_FEED]: {expiration: '2025-01-01'}}, {status: 'loaded'}]);
        rerender(
            <RefreshCardFeedConnectionPage
                policy={MOCK_POLICY}
                route={MOCK_ROUTE}
            />,
        );
        await waitForBatchedUpdates();

        expect(setFeedRefreshComplete).toHaveBeenCalledTimes(1);
    });

    it('calls clearAssignCardStepAndData on unmount', async () => {
        const {unmount} = render(
            <RefreshCardFeedConnectionPage
                policy={MOCK_POLICY}
                route={MOCK_ROUTE}
            />,
        );
        await act(async () => {
            await waitForBatchedUpdates();
        });

        unmount();

        expect(clearAssignCardStepAndData).toHaveBeenCalledTimes(1);
    });
});

describe('setFeedRefreshComplete action', () => {
    let assignCard: Record<string, unknown> | undefined;

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        Onyx.connect({
            key: ONYXKEYS.ASSIGN_CARD,
            callback: (val) => {
                assignCard = val as Record<string, unknown>;
            },
        });
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('clears isRefreshing when OAuth feed connection refreshes', async () => {
        await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {isRefreshing: true, currentStep: CONST.COMPANY_CARD.STEP.BANK_CONNECTION});
        await waitForBatchedUpdates();
        expect(assignCard?.isRefreshing).toBe(true);

        // eslint-disable-next-line @typescript-eslint/consistent-type-imports
        const {setFeedRefreshComplete: actualSetFeedRefreshComplete} = jest.requireActual<typeof import('@libs/actions/CompanyCards')>('@libs/actions/CompanyCards');
        actualSetFeedRefreshComplete();
        await waitForBatchedUpdates();

        // Onyx removes the key when merging null, so isRefreshing becomes falsy
        expect(assignCard?.isRefreshing).toBeFalsy();
    });

    it('sets isRefreshing and currentStep when starting a feed refresh', async () => {
        // eslint-disable-next-line @typescript-eslint/consistent-type-imports
        const {setAssignCardStepAndData: actualSetAssignCardStepAndData} = jest.requireActual<typeof import('@libs/actions/CompanyCards')>('@libs/actions/CompanyCards');
        actualSetAssignCardStepAndData({currentStep: CONST.COMPANY_CARD.STEP.BANK_CONNECTION, isRefreshing: true});
        await waitForBatchedUpdates();

        expect(assignCard?.isRefreshing).toBe(true);
        expect(assignCard?.currentStep).toBe(CONST.COMPANY_CARD.STEP.BANK_CONNECTION);
    });
});
