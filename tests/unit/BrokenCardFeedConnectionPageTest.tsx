import {act, cleanup, render, screen} from '@testing-library/react-native';

import useCardFeeds from '@hooks/useCardFeeds';

import {clearAssignCardStepAndData} from '@libs/actions/CompanyCards';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// The policy loading HOC would need a full policy in Onyx before rendering anything, which these tests do not care about
jest.mock('@pages/workspace/withPolicyAndFullscreenLoading', () => (Component: React.ComponentType) => Component);

jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('@hooks/useCardFeeds', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@pages/workspace/companyCards/BankConnection', () => ({
    __esModule: true,

    default: () => {
        // jest.mock factories are hoisted above imports, so the module has to be required inside
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const {View} = require('react-native');
        return <View testID="BankConnection" />;
    },
}));

jest.mock('@pages/workspace/companyCards/addNew/PlaidConnectionStep', () => ({
    __esModule: true,

    default: () => {
        // jest.mock factories are hoisted above imports, so the module has to be required inside
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const {View} = require('react-native');
        return <View testID="PlaidConnectionStep" />;
    },
}));

jest.mock('@pages/ErrorPage/NotFoundPage', () => ({
    __esModule: true,

    default: () => {
        // jest.mock factories are hoisted above imports, so the module has to be required inside
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const {View} = require('react-native');
        return <View testID="NotFoundPage" />;
    },
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    closeRHPFlow: jest.fn(),
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
// Required after the mocks above are registered so the page picks up the mocked HOC and children
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const BrokenCardFeedConnectionPage = require('@pages/workspace/companyCards/BrokenCardFeedConnectionPage').default;

const DIRECT_FEED = `${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}#99999` as const;
const COMMERCIAL_FEED = `${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}#99999` as const;
const MOCK_POLICY = {id: 'policy1'};

function mockFeeds(feedKey: string) {
    mockUseCardFeeds.mockReturnValue([
        {[feedKey]: {feed: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE, accountList: [], credentials: '', expiration: 20240101}},
        {status: 'loaded'},
        undefined,
        {},
        0,
    ]);
}

function renderPage(feed: string = DIRECT_FEED) {
    return render(
        <BrokenCardFeedConnectionPage
            policy={MOCK_POLICY}
            route={{params: {feed}}}
        />,
    );
}

describe('BrokenCardFeedConnectionPage', () => {
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
        mockFeeds(DIRECT_FEED);
    });

    describe('renders the connection steps it supports', () => {
        it.each([
            [CONST.COMPANY_CARD.STEP.BANK_CONNECTION, 'BankConnection'],
            [CONST.COMPANY_CARD.STEP.PLAID_CONNECTION, 'PlaidConnectionStep'],
        ])('renders %s as %s', async (currentStep, testID) => {
            await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {currentStep});

            renderPage();
            await act(async () => {
                await waitForBatchedUpdates();
            });

            expect(screen.getByTestId(testID)).toBeTruthy();
            expect(screen.queryByTestId('NotFoundPage')).toBeNull();
        });
    });

    describe('never falls through to an indefinite spinner', () => {
        it.each([
            ['currentStep is not set', undefined, DIRECT_FEED],
            // The reported bug: BankConnection wrote a step this page cannot render and it became a forever spinner.
            ['currentStep is a step this page cannot render', CONST.COMPANY_CARD.STEP.ASSIGNEE, DIRECT_FEED],
            ['the feed is not a direct feed', CONST.COMPANY_CARD.STEP.BANK_CONNECTION, COMMERCIAL_FEED],
        ])('renders NotFoundPage when %s', async (_case, currentStep, feed) => {
            if (currentStep) {
                await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {currentStep});
            }
            mockFeeds(feed);

            renderPage(feed);
            await act(async () => {
                await waitForBatchedUpdates();
            });

            expect(screen.getByTestId('NotFoundPage')).toBeTruthy();
            expect(screen.queryByTestId('BankConnection')).toBeNull();
        });

        it('renders NotFoundPage when the feed is missing from the card feeds', async () => {
            await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {currentStep: CONST.COMPANY_CARD.STEP.BANK_CONNECTION});
            mockUseCardFeeds.mockReturnValue([{}, {status: 'loaded'}, undefined, {}, 0]);

            renderPage();
            await act(async () => {
                await waitForBatchedUpdates();
            });

            expect(screen.getByTestId('NotFoundPage')).toBeTruthy();
        });
    });

    it('calls clearAssignCardStepAndData on unmount', async () => {
        await Onyx.merge(ONYXKEYS.ASSIGN_CARD, {currentStep: CONST.COMPANY_CARD.STEP.BANK_CONNECTION});

        const {unmount} = renderPage();
        await act(async () => {
            await waitForBatchedUpdates();
        });

        unmount();

        expect(clearAssignCardStepAndData).toHaveBeenCalledTimes(1);
    });
});
