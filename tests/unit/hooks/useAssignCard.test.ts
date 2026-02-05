/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useAssignCard from '@hooks/useAssignCard';
import useCardFeeds from '@hooks/useCardFeeds';
import useIsAllowedToIssueCompanyCard from '@hooks/useIsAllowedToIssueCompanyCard';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CompanyCardFeed, CompanyCardFeedWithDomainID} from '@src/types/onyx/CardFeeds';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const mockPolicyID = 'policy123';
const workspaceAccountID = 11111111;

// Custom feed (VCF) - commercial feed
const mockCustomFeed: CompanyCardFeedWithDomainID = `${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}#${workspaceAccountID}` as CompanyCardFeedWithDomainID;

// Direct feed (Plaid) - has accountList
const mockPlaidFeed: CompanyCardFeedWithDomainID = `plaid.ins_123#${workspaceAccountID}` as CompanyCardFeedWithDomainID;

const mockCustomFeedData = {
    [mockCustomFeed]: {
        liabilityType: 'personal',
        pending: false,
        domainID: workspaceAccountID,
        customFeedName: 'Custom VCF feed',
        feed: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA as CompanyCardFeed,
    },
};

const mockPlaidFeedData = {
    [mockPlaidFeed]: {
        liabilityType: 'corporate',
        pending: false,
        domainID: workspaceAccountID,
        customFeedName: 'Plaid Bank cards',
        feed: 'plaid.ins_123' as CompanyCardFeed,
        accountList: ['Plaid Checking 0000', 'Plaid Credit Card 3333'],
        credentials: 'xxxxx',
        expiration: Date.now() / 1000 + 86400, // expires tomorrow
    },
};

const mockPolicy = {
    id: mockPolicyID,
    workspaceAccountID,
    employeeList: {
        'user1@example.com': {email: 'user1@example.com'},
        'user2@example.com': {email: 'user2@example.com'},
    },
};

// Mock useOnyx hook
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: jest.fn(() => [undefined, {status: 'loaded'}]),
}));

// Mock all the hooks
jest.mock('@hooks/useCardFeeds', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/usePolicy', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@hooks/useIsAllowedToIssueCompanyCard', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
        setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => callback()),
    },
}));

jest.mock('@libs/actions/CompanyCards', () => ({
    clearAddNewCardFlow: jest.fn(),
    clearAssignCardStepAndData: jest.fn(),
    setAssignCardStepAndData: jest.fn(),
    setAddNewCompanyCardStepAndData: jest.fn(),
    openPolicyCompanyCardsPage: jest.fn(),
}));

jest.mock('@libs/actions/Plaid', () => ({
    importPlaidAccounts: jest.fn(),
}));

// Mock the DelegateNoAccessContext
jest.mock('@components/DelegateNoAccessModalProvider');

describe('useAssignCard', () => {
    const mockSetShouldShowOfflineModal = jest.fn();

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();

        // Default mock returns
        (usePolicy as jest.Mock).mockReturnValue(mockPolicy);
        (useNetwork as jest.Mock).mockReturnValue({isOffline: false, onReconnect: jest.fn()});
        (useIsAllowedToIssueCompanyCard as jest.Mock).mockReturnValue(true);
        (useOnyx as jest.Mock).mockReturnValue([undefined, {status: 'loaded'}]);
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        await Onyx.clear();
    });

    describe('isAssigningCardDisabled state', () => {
        it('should return isAssigningCardDisabled true when feed data is pending', () => {
            const pendingFeedData = {
                [mockCustomFeed]: {
                    ...mockCustomFeedData[mockCustomFeed],
                    pending: true,
                },
            };
            (useCardFeeds as jest.Mock).mockReturnValue([pendingFeedData, {status: 'loaded'}, undefined]);

            const {result} = renderHook(() =>
                useAssignCard({
                    feedName: mockCustomFeed,
                    policyID: mockPolicyID,
                    setShouldShowOfflineModal: mockSetShouldShowOfflineModal,
                }),
            );

            expect(result.current.isAssigningCardDisabled).toBe(true);
        });

        it('should return isAssigningCardDisabled true when user is not allowed to issue cards', () => {
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined]);
            (useIsAllowedToIssueCompanyCard as jest.Mock).mockReturnValue(false);

            const {result} = renderHook(() =>
                useAssignCard({
                    feedName: mockCustomFeed,
                    policyID: mockPolicyID,
                    setShouldShowOfflineModal: mockSetShouldShowOfflineModal,
                }),
            );

            expect(result.current.isAssigningCardDisabled).toBe(true);
        });

        it('should return isAssigningCardDisabled false when all conditions are met', () => {
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined]);

            const {result} = renderHook(() =>
                useAssignCard({
                    feedName: mockCustomFeed,
                    policyID: mockPolicyID,
                    setShouldShowOfflineModal: mockSetShouldShowOfflineModal,
                }),
            );

            expect(result.current.isAssigningCardDisabled).toBe(false);
        });
    });

    describe('assignCard function - offline handling', () => {
        it('should show offline modal for direct feed when offline', () => {
            (useCardFeeds as jest.Mock).mockReturnValue([mockPlaidFeedData, {status: 'loaded'}, undefined]);
            (useNetwork as jest.Mock).mockReturnValue({isOffline: true, onReconnect: jest.fn()});

            const {result} = renderHook(() =>
                useAssignCard({
                    feedName: mockPlaidFeed,
                    policyID: mockPolicyID,
                    setShouldShowOfflineModal: mockSetShouldShowOfflineModal,
                }),
            );

            result.current.assignCard('Plaid Checking 0000', 'Plaid Checking 0000');

            expect(mockSetShouldShowOfflineModal).toHaveBeenCalledWith(true);
        });

        it('should not show offline modal for commercial feed when offline', () => {
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined]);
            (useNetwork as jest.Mock).mockReturnValue({isOffline: true, onReconnect: jest.fn()});

            const {result} = renderHook(() =>
                useAssignCard({
                    feedName: mockCustomFeed,
                    policyID: mockPolicyID,
                    setShouldShowOfflineModal: mockSetShouldShowOfflineModal,
                }),
            );

            result.current.assignCard('490901XXXXXX1234', 'v12:74E3CA3C4C0FA02F4C754FEN4RYP3ED1');

            // Commercial feeds should work offline - offline modal should not be shown
            expect(mockSetShouldShowOfflineModal).not.toHaveBeenCalled();
        });
    });

    describe('assignCard function - card identifiers', () => {
        it('should accept different cardName and cardID for commercial feeds', () => {
            (useCardFeeds as jest.Mock).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined]);

            const {result} = renderHook(() =>
                useAssignCard({
                    feedName: mockCustomFeed,
                    policyID: mockPolicyID,
                    setShouldShowOfflineModal: mockSetShouldShowOfflineModal,
                }),
            );

            const cardName = '490901XXXXXX1234';
            const encryptedCardID = 'v12:74E3CA3C4C0FA02F4C754FEN4RYP3ED1';

            // These should be different for commercial feeds
            expect(cardName).not.toBe(encryptedCardID);

            // The hook should accept both values without throwing
            expect(() => result.current.assignCard(cardName, encryptedCardID)).not.toThrow();
        });

        it('should accept same cardName and cardID for direct feeds', () => {
            (useCardFeeds as jest.Mock).mockReturnValue([mockPlaidFeedData, {status: 'loaded'}, undefined]);

            const {result} = renderHook(() =>
                useAssignCard({
                    feedName: mockPlaidFeed,
                    policyID: mockPolicyID,
                    setShouldShowOfflineModal: mockSetShouldShowOfflineModal,
                }),
            );

            const cardName = 'Plaid Checking 0000';
            const cardID = 'Plaid Checking 0000';

            // For direct feeds, cardName equals cardID
            expect(cardName).toBe(cardID);

            // The hook should accept same values without throwing
            expect(() => result.current.assignCard(cardName, cardID)).not.toThrow();
        });
    });
});
