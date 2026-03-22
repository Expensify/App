import {act, cleanup, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import * as CompanyCardsActions from '@libs/actions/CompanyCards';
import * as Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Bypass the HOC and render the inner component directly
jest.mock('@pages/workspace/withPolicyAndFullscreenLoading', () => (Component: React.ComponentType) => Component);

jest.mock('@hooks/useCardFeeds', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@pages/workspace/companyCards/BankConnection', () => ({
    __esModule: true,
    // eslint-disable-next-line react/display-name
    default: () => {
        const {View} = require('react-native');
        return <View testID="BankConnection" />;
    },
}));

jest.mock('@pages/workspace/companyCards/addNew/PlaidConnectionStep', () => ({
    __esModule: true,
    // eslint-disable-next-line react/display-name
    default: () => {
        const {View} = require('react-native');
        return <View testID="PlaidConnectionStep" />;
    },
}));

jest.mock('@pages/LoadingPage', () => ({
    __esModule: true,
    // eslint-disable-next-line react/display-name
    default: () => {
        const {View} = require('react-native');
        return <View testID="LoadingPage" />;
    },
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    closeRHPFlow: jest.fn(),
    navigate: jest.fn(),
    goBack: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn(),
}));

jest.mock('@libs/actions/CompanyCards', () => ({
    ...jest.requireActual<typeof import('@libs/actions/CompanyCards')>('@libs/actions/CompanyCards'),
    clearAssignCardStepAndData: jest.fn(),
    setFeedRefreshComplete: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const useCardFeeds = require('@hooks/useCardFeeds').default as jest.Mock;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const RefreshCardFeedConnectionPage = require('@pages/workspace/companyCards/RefreshCardFeedConnectionPage').default;

const MOCK_FEED = 'oauth.chase_bank_card_99999' as const;

function buildProps(overrides = {}) {
    return {
        policy: {id: 'policy1'},
        route: {params: {feed: MOCK_FEED}},
        ...overrides,
    };
}

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
        render(<RefreshCardFeedConnectionPage {...buildProps()} />);
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

        render(<RefreshCardFeedConnectionPage {...buildProps()} />);
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

        render(<RefreshCardFeedConnectionPage {...buildProps()} />);
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

        render(<RefreshCardFeedConnectionPage {...buildProps()} />);
        await act(async () => {
            await waitForBatchedUpdates();
        });

        // Simulate importPlaidAccounts successData clearing isRefreshing (Plaid path)
        await act(async () => {
            await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {isRefreshing: null});
            await waitForBatchedUpdates();
        });

        expect(Navigation.closeRHPFlow).toHaveBeenCalledTimes(1);
    });

    it('calls setFeedRefreshComplete when OAuth feed expiration updates while refreshing', async () => {
        await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {
            currentStep: CONST.COMPANY_CARD.STEP.BANK_CONNECTION,
            isRefreshing: true,
        });

        const props = buildProps();
        const {rerender} = render(<RefreshCardFeedConnectionPage {...props} />);
        await act(async () => {
            await waitForBatchedUpdates();
        });

        // Simulate bank re-authentication updating the feed expiration (OAuth path).
        // Re-render is needed to propagate the new mock return value.
        await act(async () => {
            useCardFeeds.mockReturnValue([{[MOCK_FEED]: {expiration: '2025-01-01'}}, {status: 'loaded'}]);
            rerender(<RefreshCardFeedConnectionPage {...props} />);
            await waitForBatchedUpdates();
        });

        expect(CompanyCardsActions.setFeedRefreshComplete).toHaveBeenCalledTimes(1);
    });

    it('calls clearAssignCardStepAndData on unmount', async () => {
        const {unmount} = render(<RefreshCardFeedConnectionPage {...buildProps()} />);
        await act(async () => {
            await waitForBatchedUpdates();
        });

        unmount();

        expect(CompanyCardsActions.clearAssignCardStepAndData).toHaveBeenCalledTimes(1);
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

        const {setFeedRefreshComplete} = jest.requireActual<typeof import('@libs/actions/CompanyCards')>('@libs/actions/CompanyCards');
        setFeedRefreshComplete();
        await waitForBatchedUpdates();

        // Onyx removes the key when merging null, so isRefreshing becomes falsy
        expect(assignCard?.isRefreshing).toBeFalsy();
    });

    it('sets isRefreshing and currentStep when starting a feed refresh', async () => {
        const {setAssignCardStepAndData} = jest.requireActual<typeof import('@libs/actions/CompanyCards')>('@libs/actions/CompanyCards');
        setAssignCardStepAndData({currentStep: CONST.COMPANY_CARD.STEP.BANK_CONNECTION, isRefreshing: true});
        await waitForBatchedUpdates();

        expect(assignCard?.isRefreshing).toBe(true);
        expect(assignCard?.currentStep).toBe(CONST.COMPANY_CARD.STEP.BANK_CONNECTION);
    });
});
