import {renderHook} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';
import useReconciliationCardFeeds from '@hooks/useReconciliationCardFeeds';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const US_PROGRAM = CONST.COUNTRY.US;
const CURRENT_PROGRAM = CONST.EXPENSIFY_CARD.CARD_PROGRAM.CURRENT;

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

    describe('a feed on the CURRENT program', () => {
        it("is a candidate when it is this workspace's own feed", () => {
            // Given this workspace's own feed provisioned only on the deprecated CURRENT program, which the feed selectors hide but which still reconciles
            mockCollections({
                cardSettings: {[cardSettingsKey(workspaceAccountID)]: {[CURRENT_PROGRAM]: {paymentBankAccountID: 23242}, isEnabled: true}},
                policies: adminPolicyWithAccount(currentPolicyID, workspaceAccountID),
            });

            // When the reconciliation candidates are resolved
            // Then the feed is offered, so its admin can still reach the toggle
            expect(candidateFundIDs()).toEqual([workspaceAccountID]);
        });

        it('is a candidate and the default when it is an unclaimed domain feed linked to this policy', () => {
            // Given an unclaimed domain feed on the CURRENT program that links this policy, and no feed of this workspace's own
            mockCollections({
                cardSettings: {[cardSettingsKey(domainFundID)]: {[CURRENT_PROGRAM]: {paymentBankAccountID: 23242, linkedPolicyIDs: [currentPolicyID]}, isEnabled: true}},
                policies: adminPolicyWithAccount(currentPolicyID, workspaceAccountID),
                domains: domainWithAdmin(domainFundID),
            });

            // When the reconciliation candidates are resolved
            // Then the domain feed is offered and selected, rather than falling back to this workspace's account, which holds no feed
            expect(candidateFundIDs()).toEqual([domainFundID]);
            expect(defaultFundID()).toBe(domainFundID);
        });

        it('is not a candidate when another workspace has claimed it as preferred', () => {
            // Given a domain feed on the CURRENT program that links this policy but is already claimed by another workspace
            mockCollections({
                cardSettings: {
                    [cardSettingsKey(domainFundID)]: {[CURRENT_PROGRAM]: {paymentBankAccountID: 23242, preferredPolicy: otherPolicyID, linkedPolicyIDs: [currentPolicyID]}, isEnabled: true},
                },
                policies: adminPolicyWithAccount(currentPolicyID, workspaceAccountID),
                domains: domainWithAdmin(domainFundID),
            });

            // When the reconciliation candidates are resolved
            // Then the feed is withheld, because the CURRENT program follows the same claim rule as US and GB
            expect(candidateFundIDs()).toEqual([]);
        });

        it('is offered once when the domain also has a US program', () => {
            // Given a domain whose settings hold both a US and a CURRENT program, claimed by this policy through the CURRENT block
            mockCollections({
                cardSettings: {
                    [cardSettingsKey(domainFundID)]: {
                        [US_PROGRAM]: {paymentBankAccountID: 23242},
                        [CURRENT_PROGRAM]: {paymentBankAccountID: 23243, preferredPolicy: currentPolicyID},
                        isEnabled: true,
                    },
                },
                policies: adminPolicyWithAccount(currentPolicyID, workspaceAccountID),
                domains: domainWithAdmin(domainFundID),
            });

            // When the reconciliation candidates are resolved
            // Then the domain appears once, since reconciliation is set per feed account, not per program
            expect(candidateFundIDs()).toEqual([domainFundID]);
        });

        it('is a candidate and the default when it is an un-nested domain feed linked to this policy', () => {
            // Given an unclaimed pre-2024 domain feed stored un-nested, with its settlement account and links on the settings root, and no feed of this workspace's own
            mockCollections({
                cardSettings: {[cardSettingsKey(domainFundID)]: {paymentBankAccountID: 23242, linkedPolicyIDs: [currentPolicyID], limit: 1000000}},
                policies: adminPolicyWithAccount(currentPolicyID, workspaceAccountID),
                domains: domainWithAdmin(domainFundID),
            });

            // When the reconciliation candidates are resolved
            // Then the feed is offered and selected, so the page does not fall back to this workspace's account, which holds no settings
            expect(candidateFundIDs()).toEqual([domainFundID]);
            expect(defaultFundID()).toBe(domainFundID);
        });

        it("is a candidate when it is this workspace's own un-nested feed", () => {
            // Given this workspace's own pre-2024 feed stored un-nested
            mockCollections({
                cardSettings: {[cardSettingsKey(workspaceAccountID)]: {paymentBankAccountID: 23242, limit: 1000000}},
                policies: adminPolicyWithAccount(currentPolicyID, workspaceAccountID),
            });

            // When the reconciliation candidates are resolved
            // Then the feed is offered
            expect(candidateFundIDs()).toEqual([workspaceAccountID]);
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

        it('ignores the card pages default when it names a feed this workspace cannot claim', () => {
            // useDefaultFundID prioritizes the last-selected-feed NVP, which the Expensify Card pages can point at
            // another workspace's feed. Toggling reconciliation on that feed would be unauthorized.
            mockDefaultFundIDFromCardPages = otherWorkspaceAccountID;
            mockCollections({
                cardSettings: {
                    [cardSettingsKey(otherWorkspaceAccountID)]: configuredCardSettings(),
                    [cardSettingsKey(domainFundID)]: configuredCardSettings({preferredPolicy: currentPolicyID}),
                },
                policies: {...adminPolicyWithAccount(currentPolicyID, workspaceAccountID), ...adminPolicyWithAccount(otherPolicyID, otherWorkspaceAccountID)},
                domains: domainWithAdmin(domainFundID),
            });

            expect(defaultFundID()).toBe(domainFundID);
        });

        it("falls back to this workspace's own account when nothing is claimable", () => {
            mockDefaultFundIDFromCardPages = otherWorkspaceAccountID;
            mockCollections({
                cardSettings: {[cardSettingsKey(otherWorkspaceAccountID)]: configuredCardSettings()},
                policies: {...adminPolicyWithAccount(currentPolicyID, workspaceAccountID), ...adminPolicyWithAccount(otherPolicyID, otherWorkspaceAccountID)},
            });

            expect(candidateFundIDs()).toEqual([]);
            expect(defaultFundID()).toBe(workspaceAccountID);
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
