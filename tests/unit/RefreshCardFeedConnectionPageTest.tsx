import {act, cleanup, render, screen} from '@testing-library/react-native';

import useCardFeeds from '@hooks/useCardFeeds';

import {clearAssignCardStepAndData} from '@libs/actions/CompanyCards';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Bypass the HOC and render the inner component directly
jest.mock('@pages/workspace/withPolicyAndFullscreenLoading', () => (Component: React.ComponentType) => Component);

jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
}));

const mockCloseRHPFlow = jest.fn();

jest.mock('@hooks/useCardFeeds', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@pages/workspace/companyCards/BankConnection', () => ({
    __esModule: true,

    default: () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const {View} = require('react-native');
        return <View testID="BankConnection" />;
    },
}));

jest.mock('@pages/workspace/companyCards/addNew/PlaidConnectionStep', () => ({
    __esModule: true,

    default: () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const {View} = require('react-native');
        return <View testID="PlaidConnectionStep" />;
    },
}));

jest.mock('@pages/LoadingPage', () => ({
    __esModule: true,

    default: () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const {View} = require('react-native');
        return <View testID="LoadingPage" />;
    },
}));

jest.mock('@pages/ErrorPage/NotFoundPage', () => ({
    __esModule: true,

    default: () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const {View} = require('react-native');
        return <View testID="NotFoundPage" />;
    },
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    closeRHPFlow: mockCloseRHPFlow,
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    navigate: jest.fn(),
    goBack: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn(),
    getTopmostReportId: jest.fn(),
}));

jest.mock('@libs/actions/CompanyCards', () => ({
    clearAssignCardStepAndData: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

const mockUseCardFeeds = jest.mocked(useCardFeeds);
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const RefreshCardFeedConnectionPage = require('@pages/workspace/companyCards/RefreshCardFeedConnectionPage').default;

const MOCK_FEED = `${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}#99999` as const;
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
        mockUseCardFeeds.mockReturnValue([
            {[MOCK_FEED]: {feed: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE, accountList: [], credentials: '', expiration: 20240101}},
            {status: 'loaded'},
            undefined,
            {},
            0,
        ]);
    });

    it('renders NotFoundPage when currentStep is not set', async () => {
        render(
            <RefreshCardFeedConnectionPage
                policy={MOCK_POLICY}
                route={MOCK_ROUTE}
            />,
        );
        await act(async () => {
            await waitForBatchedUpdates();
        });

        expect(screen.getByTestId('NotFoundPage')).toBeTruthy();
        expect(screen.queryByTestId('BankConnection')).toBeNull();
    });

    it('renders LoadingPage when currentStep is an unrecognized value', async () => {
        await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
            // @ts-expect-error -- deliberately unrecognized runtime step exercises the loading fallback.
            currentStep: 'UNKNOWN_STEP',
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

    it('closes RHP flow when OAuth feed expiration updates while refreshing', async () => {
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
        mockUseCardFeeds.mockReturnValue([
            {[MOCK_FEED]: {feed: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE, accountList: [], credentials: '', expiration: 20250101}},
            {status: 'loaded'},
            undefined,
            {},
            0,
        ]);
        rerender(
            <RefreshCardFeedConnectionPage
                policy={MOCK_POLICY}
                route={MOCK_ROUTE}
            />,
        );
        await waitForBatchedUpdates();

        expect(mockCloseRHPFlow).toHaveBeenCalledTimes(1);
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

describe('Related route getRoute helpers', () => {
    it('WORKSPACE_COMPANY_CARDS_REFRESH_CARD_FEED_CONNECTION encodes feed in URL', () => {
        // @ts-expect-error -- deliberately malformed feed input exercises URL encoding.
        const result = ROUTES.WORKSPACE_COMPANY_CARDS_REFRESH_CARD_FEED_CONNECTION.getRoute('pol1', 'oauth.chase 99999');
        expect(result).toBe('workspaces/pol1/company-cards/oauth.chase%2099999/refresh-card-feed-connection');
    });
});
