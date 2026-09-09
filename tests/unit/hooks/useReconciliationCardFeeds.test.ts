import {renderHook} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';
import useReconciliationCardFeeds from '@hooks/useReconciliationCardFeeds';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const US_PROGRAM = CONST.COUNTRY.US;

const currentPolicyID = 'policy_current';
const otherPolicyID = 'policy_other';
const currentUserAccountID = 1001;

const workspaceAccountID = 9001;
const otherWorkspaceAccountID = 9002;
const domainFundID = 5555;

jest.mock('@hooks/useOnyx', () => jest.fn());

const mockUseOnyx = jest.mocked(useOnyx);

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: currentUserAccountID}),
}));

jest.mock('@hooks/useWorkspaceAccountID', () => ({
    __esModule: true,
    default: () => workspaceAccountID,
}));

let mockDefaultFundIDFromCardPages = workspaceAccountID;

jest.mock('@hooks/useDefaultFundID', () => ({
    __esModule: true,
    default: () => mockDefaultFundIDFromCardPages,
}));

function cardSettingsKey(fundID: number) {
    return `${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${fundID}`;
}

function configuredCardSettings(overrides: Record<string, unknown> = {}) {
    return {
        [US_PROGRAM]: {paymentBankAccountID: 23242},
        isEnabled: true,
        ...overrides,
    };
}

/** A domain feed: the current user is an admin of the domain whose account ID is the feed's fundID. */
function domainWithAdmin(fundID: number) {
    return {
        [`${ONYXKEYS.COLLECTION.DOMAIN}${fundID}`]: {
            accountID: fundID,
            [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}0`]: currentUserAccountID,
        },
    };
}

/** A workspace feed: an admin policy whose policyAccountID backs the feed's fundID. */
function adminPolicyWithAccount(policyID: string, policyAccountID: number) {
    return {
        [`${ONYXKEYS.COLLECTION.POLICY}${policyID.toUpperCase()}`]: {
            role: CONST.POLICY.ROLE.ADMIN,
            policyAccountID,
        },
    };
}

function mockCollections({cardSettings = {}, policies = {}, domains = {}}: {cardSettings?: Record<string, unknown>; policies?: Record<string, unknown>; domains?: Record<string, unknown>}) {
    mockUseOnyx.mockImplementation((key) => {
        if (key === ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS) {
            return [cardSettings, {status: 'loaded'}];
        }
        if (key === ONYXKEYS.COLLECTION.POLICY) {
            return [policies, {status: 'loaded'}];
        }
        if (key === ONYXKEYS.COLLECTION.DOMAIN) {
            return [domains, {status: 'loaded'}];
        }
        return [undefined, {status: 'loaded'}];
    });
}

function candidateFundIDs(policyID: string | undefined = currentPolicyID) {
    const {result} = renderHook(() => useReconciliationCardFeeds(policyID));
    return result.current.candidates.map((entry) => entry.fundID);
}

function defaultFundID(policyID: string | undefined = currentPolicyID) {
    const {result} = renderHook(() => useReconciliationCardFeeds(policyID));
    return result.current.defaultFundID;
}

describe('useReconciliationCardFeeds', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockDefaultFundIDFromCardPages = workspaceAccountID;
        mockCollections({});
    });

    describe("this workspace's own feed", () => {
        it('is a candidate even when nothing links or prefers it', () => {
            mockCollections({
                cardSettings: {[cardSettingsKey(workspaceAccountID)]: configuredCardSettings()},
                policies: adminPolicyWithAccount(currentPolicyID, workspaceAccountID),
            });

            expect(candidateFundIDs()).toEqual([workspaceAccountID]);
        });

        it('is a candidate even when another workspace is the preferred policy', () => {
            mockCollections({
                cardSettings: {[cardSettingsKey(workspaceAccountID)]: configuredCardSettings({preferredPolicy: otherPolicyID})},
                policies: adminPolicyWithAccount(currentPolicyID, workspaceAccountID),
            });

            expect(candidateFundIDs()).toEqual([workspaceAccountID]);
        });

        it('is dropped while the feed is pending delete', () => {
            mockCollections({
                cardSettings: {[cardSettingsKey(workspaceAccountID)]: configuredCardSettings({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})},
                policies: adminPolicyWithAccount(currentPolicyID, workspaceAccountID),
            });

            expect(candidateFundIDs()).toEqual([]);
        });
    });

    describe("another workspace's feed", () => {
        it('is never a candidate, even when it names this policy as preferred', () => {
            mockCollections({
                cardSettings: {[cardSettingsKey(otherWorkspaceAccountID)]: configuredCardSettings({preferredPolicy: currentPolicyID})},
                policies: {...adminPolicyWithAccount(currentPolicyID, workspaceAccountID), ...adminPolicyWithAccount(otherPolicyID, otherWorkspaceAccountID)},
            });

            expect(candidateFundIDs()).toEqual([]);
        });

        it('is never a candidate, even when this policy is linked to it', () => {
            mockCollections({
                cardSettings: {[cardSettingsKey(otherWorkspaceAccountID)]: configuredCardSettings({linkedPolicyIDs: [currentPolicyID]})},
                policies: {...adminPolicyWithAccount(currentPolicyID, workspaceAccountID), ...adminPolicyWithAccount(otherPolicyID, otherWorkspaceAccountID)},
            });

            expect(candidateFundIDs()).toEqual([]);
        });
    });

    describe('a domain feed', () => {
        it('is a candidate when it names this policy as preferred', () => {
            mockCollections({
                cardSettings: {[cardSettingsKey(domainFundID)]: configuredCardSettings({preferredPolicy: currentPolicyID})},
                policies: adminPolicyWithAccount(currentPolicyID, workspaceAccountID),
                domains: domainWithAdmin(domainFundID),
            });

            expect(candidateFundIDs()).toEqual([domainFundID]);
        });

        it('matches the preferred policy case-insensitively', () => {
            mockCollections({
                cardSettings: {[cardSettingsKey(domainFundID)]: configuredCardSettings({preferredPolicy: currentPolicyID.toUpperCase()})},
                policies: adminPolicyWithAccount(currentPolicyID, workspaceAccountID),
                domains: domainWithAdmin(domainFundID),
            });

            expect(candidateFundIDs(currentPolicyID.toLowerCase())).toEqual([domainFundID]);
        });

        it('is not a candidate when another workspace has claimed it as preferred', () => {
            mockCollections({
                cardSettings: {[cardSettingsKey(domainFundID)]: configuredCardSettings({preferredPolicy: otherPolicyID})},
                policies: adminPolicyWithAccount(currentPolicyID, workspaceAccountID),
                domains: domainWithAdmin(domainFundID),
            });

            expect(candidateFundIDs()).toEqual([]);
        });

        it('is not a candidate when another workspace has claimed it, even if this policy is linked', () => {
            mockCollections({
                cardSettings: {[cardSettingsKey(domainFundID)]: configuredCardSettings({preferredPolicy: otherPolicyID, linkedPolicyIDs: [currentPolicyID]})},
                policies: adminPolicyWithAccount(currentPolicyID, workspaceAccountID),
                domains: domainWithAdmin(domainFundID),
            });

            expect(candidateFundIDs()).toEqual([]);
        });

        it('is a candidate when unclaimed and this policy is linked to it', () => {
            mockCollections({
                cardSettings: {[cardSettingsKey(domainFundID)]: configuredCardSettings({linkedPolicyIDs: [currentPolicyID]})},
                policies: adminPolicyWithAccount(currentPolicyID, workspaceAccountID),
                domains: domainWithAdmin(domainFundID),
            });

            expect(candidateFundIDs()).toEqual([domainFundID]);
        });

        it('is not a candidate when unclaimed and this policy is not linked to it', () => {
            mockCollections({
                cardSettings: {[cardSettingsKey(domainFundID)]: configuredCardSettings()},
                policies: adminPolicyWithAccount(currentPolicyID, workspaceAccountID),
                domains: domainWithAdmin(domainFundID),
            });

            expect(candidateFundIDs()).toEqual([]);
        });

        it('is not a candidate when unclaimed and only another workspace is linked to it', () => {
            mockCollections({
                cardSettings: {[cardSettingsKey(domainFundID)]: configuredCardSettings({linkedPolicyIDs: [otherPolicyID]})},
                policies: adminPolicyWithAccount(currentPolicyID, workspaceAccountID),
                domains: domainWithAdmin(domainFundID),
            });

            expect(candidateFundIDs()).toEqual([]);
        });

        it('resolves the preferred policy nested under the program block', () => {
            mockCollections({
                cardSettings: {
                    [cardSettingsKey(domainFundID)]: {
                        [US_PROGRAM]: {paymentBankAccountID: 23242, preferredPolicy: currentPolicyID},
                        isEnabled: true,
                    },
                },
                policies: adminPolicyWithAccount(currentPolicyID, workspaceAccountID),
                domains: domainWithAdmin(domainFundID),
            });

            expect(candidateFundIDs()).toEqual([domainFundID]);
        });
    });

    it('returns no candidates when policyID is undefined', () => {
        mockCollections({
            cardSettings: {[cardSettingsKey(domainFundID)]: configuredCardSettings()},
            policies: adminPolicyWithAccount(currentPolicyID, workspaceAccountID),
            domains: domainWithAdmin(domainFundID),
        });

        expect(candidateFundIDs(undefined)).toEqual([]);
    });

    describe('the default selection', () => {
        it("is this workspace's own feed even when the card pages last selected a domain feed", () => {
            mockDefaultFundIDFromCardPages = domainFundID;
            mockCollections({
                cardSettings: {
                    [cardSettingsKey(workspaceAccountID)]: configuredCardSettings(),
                    [cardSettingsKey(domainFundID)]: configuredCardSettings({preferredPolicy: currentPolicyID}),
                },
                policies: adminPolicyWithAccount(currentPolicyID, workspaceAccountID),
                domains: domainWithAdmin(domainFundID),
            });

            expect(defaultFundID()).toBe(workspaceAccountID);
        });

        it('falls back to the card pages default when this workspace has no feed of its own', () => {
            mockDefaultFundIDFromCardPages = domainFundID;
            mockCollections({
                cardSettings: {[cardSettingsKey(domainFundID)]: configuredCardSettings({preferredPolicy: currentPolicyID})},
                policies: adminPolicyWithAccount(currentPolicyID, workspaceAccountID),
                domains: domainWithAdmin(domainFundID),
            });

            expect(defaultFundID()).toBe(domainFundID);
        });

        it('falls back to the card pages default when the own feed is pending delete', () => {
            mockDefaultFundIDFromCardPages = domainFundID;
            mockCollections({
                cardSettings: {
                    [cardSettingsKey(workspaceAccountID)]: configuredCardSettings({pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
                    [cardSettingsKey(domainFundID)]: configuredCardSettings({preferredPolicy: currentPolicyID}),
                },
                policies: adminPolicyWithAccount(currentPolicyID, workspaceAccountID),
                domains: domainWithAdmin(domainFundID),
            });

            expect(defaultFundID()).toBe(domainFundID);
        });
    });

    it('offers the own feed and an unclaimed linked domain feed together', () => {
        mockCollections({
            cardSettings: {
                [cardSettingsKey(workspaceAccountID)]: configuredCardSettings(),
                [cardSettingsKey(domainFundID)]: configuredCardSettings({linkedPolicyIDs: [currentPolicyID]}),
                [cardSettingsKey(otherWorkspaceAccountID)]: configuredCardSettings({preferredPolicy: currentPolicyID}),
            },
            policies: {...adminPolicyWithAccount(currentPolicyID, workspaceAccountID), ...adminPolicyWithAccount(otherPolicyID, otherWorkspaceAccountID)},
            domains: domainWithAdmin(domainFundID),
        });

        expect(candidateFundIDs().sort()).toEqual([domainFundID, workspaceAccountID].sort());
    });
});
