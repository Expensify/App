/* eslint-disable @typescript-eslint/naming-convention */
import {renderHook} from '@testing-library/react-native';

import useAssignCard from '@hooks/useAssignCard';
import useCardFeeds from '@hooks/useCardFeeds';
import useIsAllowedToIssueCompanyCard from '@hooks/useIsAllowedToIssueCompanyCard';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';

import {setAssignCardStepAndData} from '@libs/actions/CompanyCards';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CombinedCardFeeds, CompanyCardFeedWithDomainID, Policy} from '@src/types/onyx';
import type {CardFeedErrors, CardFeedErrorState} from '@src/types/onyx/DerivedValues';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const mockPolicyID = 'policy123';
const workspaceAccountID = 11111111;

// Custom feed (VCF) - commercial feed
const mockCustomFeed: CompanyCardFeedWithDomainID = `${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}#${workspaceAccountID}`;

// Direct feed (Chase) - has accountList
const mockDirectFeed: CompanyCardFeedWithDomainID = `${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}#${workspaceAccountID}`;

const mockCustomFeedData = {
    [mockCustomFeed]: {
        liabilityType: 'personal',
        pending: false,
        domainID: workspaceAccountID,
        customFeedName: 'Custom VCF feed',
        feed: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
    },
};

const mockDirectFeedData: CombinedCardFeeds = {
    [mockDirectFeed]: {
        liabilityType: 'corporate',
        pending: false,
        domainID: workspaceAccountID,
        customFeedName: 'Chase Bank cards',
        feed: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
        accountList: ['Chase Checking 0000', 'Chase Credit Card 3333'],
        credentials: 'xxxxx',
        expiration: Date.now() / 1000 + 86400, // expires tomorrow
    },
};

const mockPolicy = createMock<Policy>({
    id: mockPolicyID,
    policyAccountID: workspaceAccountID,
    employeeList: {
        'user1@example.com': {email: 'user1@example.com'},
        'user2@example.com': {email: 'user2@example.com'},
    },
});

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

// Mock the DelegateNoAccessModalProvider hooks
jest.mock('@components/DelegateNoAccessModalProvider', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@components/DelegateNoAccessModalProvider');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        useDelegateNoAccessState: () => ({isActingAsDelegate: false, isDelegateAccessRestricted: false}),
        useDelegateNoAccessActions: () => ({showDelegateNoAccessModal: jest.fn()}),
    };
});

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
        jest.mocked(usePolicy).mockReturnValue(mockPolicy);
        jest.mocked(useNetwork).mockReturnValue({isOffline: false});
        jest.mocked(useIsAllowedToIssueCompanyCard).mockReturnValue(true);
        jest.mocked(useOnyx).mockReturnValue([undefined, {status: 'loaded'}]);
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
            jest.mocked(useCardFeeds).mockReturnValue([pendingFeedData, {status: 'loaded'}, undefined, {}, workspaceAccountID]);

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
            jest.mocked(useCardFeeds).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined, {}, workspaceAccountID]);
            jest.mocked(useIsAllowedToIssueCompanyCard).mockReturnValue(false);

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
            jest.mocked(useCardFeeds).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined, {}, workspaceAccountID]);

            const {result} = renderHook(() =>
                useAssignCard({
                    feedName: mockCustomFeed,
                    policyID: mockPolicyID,
                    setShouldShowOfflineModal: mockSetShouldShowOfflineModal,
                }),
            );

            expect(result.current.isAssigningCardDisabled).toBe(false);
        });

        /** Points the mocked useOnyx at a CARD_FEED_ERRORS value for the custom (commercial) feed. */
        function mockFeedErrors(feedErrorState: Partial<CardFeedErrorState>) {
            jest.mocked(useOnyx).mockImplementation((key) =>
                key === ONYXKEYS.DERIVED.CARD_FEED_ERRORS
                    ? [
                          createMock<CardFeedErrors>({
                              cardFeedErrors: {[mockCustomFeed]: {shouldShowRBR: false, hasFeedErrors: false, hasWorkspaceErrors: false, isFeedConnectionBroken: false, ...feedErrorState}},
                          }),
                          {status: 'loaded'},
                      ]
                    : [undefined, {status: 'loaded'}],
            );
        }

        it('should return isAssigningCardDisabled true while the broken connection is still within the grace period', () => {
            jest.mocked(useCardFeeds).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined, {}, workspaceAccountID]);
            mockFeedErrors({isFeedConnectionBroken: true, shouldPromptBrokenConnection: true});

            const {result} = renderHook(() =>
                useAssignCard({
                    feedName: mockCustomFeed,
                    policyID: mockPolicyID,
                    setShouldShowOfflineModal: mockSetShouldShowOfflineModal,
                }),
            );

            expect(result.current.isAssigningCardDisabled).toBe(true);
        });

        // Past the grace period the feed stays flagged as broken so it can still be fixed, but assigning must not stay
        // blocked: a commercial/CSV feed cannot be reconnected by a bank login, so blocking would never resolve.
        it('should return isAssigningCardDisabled false once the broken connection is past the grace period', () => {
            jest.mocked(useCardFeeds).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined, {}, workspaceAccountID]);
            mockFeedErrors({isFeedConnectionBroken: true, shouldPromptBrokenConnection: false});

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
            jest.mocked(useCardFeeds).mockReturnValue([mockDirectFeedData, {status: 'loaded'}, undefined, {}, workspaceAccountID]);
            jest.mocked(useNetwork).mockReturnValue({isOffline: true});

            const {result} = renderHook(() =>
                useAssignCard({
                    feedName: mockDirectFeed,
                    policyID: mockPolicyID,
                    setShouldShowOfflineModal: mockSetShouldShowOfflineModal,
                }),
            );

            result.current.assignCard('Chase Checking 0000', 'Chase Checking 0000');

            expect(mockSetShouldShowOfflineModal).toHaveBeenCalledWith(true);
        });

        it('should not show offline modal for commercial feed when offline', () => {
            jest.mocked(useCardFeeds).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined, {}, workspaceAccountID]);
            jest.mocked(useNetwork).mockReturnValue({isOffline: true});

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
            jest.mocked(useCardFeeds).mockReturnValue([mockCustomFeedData, {status: 'loaded'}, undefined, {}, workspaceAccountID]);

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
            jest.mocked(useCardFeeds).mockReturnValue([mockDirectFeedData, {status: 'loaded'}, undefined, {}, workspaceAccountID]);

            const {result} = renderHook(() =>
                useAssignCard({
                    feedName: mockDirectFeed,
                    policyID: mockPolicyID,
                    setShouldShowOfflineModal: mockSetShouldShowOfflineModal,
                }),
            );

            const cardName = 'Chase Checking 0000';
            const cardID = 'Chase Checking 0000';

            // For direct feeds, cardName equals cardID
            expect(cardName).toBe(cardID);

            // The hook should accept same values without throwing
            expect(() => result.current.assignCard(cardName, cardID)).not.toThrow();
        });
    });

    describe('assignCard function - single active employee shortcut', () => {
        it('should auto-assign to the single active employee, not the first (deleted) employee in the list', () => {
            // Given a policy whose first (unfiltered) employee is pending deletion, leaving a single active employee later in the list
            const policyWithDeletedFirstEmployee = createMock<Policy>({
                id: mockPolicyID,
                policyAccountID: workspaceAccountID,
                employeeList: {
                    'admin@example.com': {email: 'admin@example.com', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
                    'employee@example.com': {email: 'employee@example.com'},
                },
            });
            jest.mocked(usePolicy).mockReturnValue(policyWithDeletedFirstEmployee);
            jest.mocked(useCardFeeds).mockReturnValue([mockDirectFeedData, {status: 'loaded'}, undefined, {}, workspaceAccountID]);

            const {result} = renderHook(() =>
                useAssignCard({
                    feedName: mockDirectFeed,
                    policyID: mockPolicyID,
                    setShouldShowOfflineModal: mockSetShouldShowOfflineModal,
                }),
            );

            result.current.assignCard('Chase Checking 0000', 'Chase Checking 0000');

            // Then the flow jumps to confirmation pre-assigned to the single active employee (not the deleted admin)
            expect(setAssignCardStepAndData).toHaveBeenCalledWith(
                expect.objectContaining({
                    currentStep: CONST.COMPANY_CARD.STEP.CONFIRMATION,
                    cardToAssign: expect.objectContaining({email: 'employee@example.com'}),
                }),
            );
        });
    });
});
