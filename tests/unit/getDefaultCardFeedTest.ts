import {getActiveExpensifyCardFeedID, getDefaultCardFeed} from '@hooks/useCardFeedsForDisplay';

import type {CardFeedForDisplay} from '@libs/CardFeedUtils';
import type {ExpensifyCardFeedEntry} from '@libs/ExpensifyCardFeedSelectorUtils';

import CONST from '@src/CONST';
import type {ExpensifyCardSettings, Policy} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';

const localeCompare = (a: string, b: string) => a.localeCompare(b);

const customFeedA: CardFeedForDisplay = {id: '1_vcf', feed: 'vcf', fundID: '1', name: 'Alpha Visa'};
const customFeedB: CardFeedForDisplay = {id: '1_cdf', feed: 'cdf', fundID: '1', name: 'Beta MasterCard'};
const commercialFeed: CardFeedForDisplay = {id: '2_oauth.chase.com', feed: 'oauth.chase.com' as CardFeedForDisplay['feed'], fundID: '2', name: 'Chase'};
const commercialFeedZ: CardFeedForDisplay = {id: '3_stripe', feed: 'stripe' as CardFeedForDisplay['feed'], fundID: '3', name: 'Stripe'};

describe('getDefaultCardFeed', () => {
    it('returns the alphabetically first feed from the active policy when it is eligible', () => {
        const cardFeedsByPolicy: Record<string, CardFeedForDisplay[]> = {
            POLICY_1: [customFeedB, customFeedA],
        };
        const result = getDefaultCardFeed(['POLICY_1'], 'POLICY_1', cardFeedsByPolicy, localeCompare);
        expect(result).toEqual(customFeedA);
    });

    it('falls back to the first eligible policy with feeds when the active policy has none', () => {
        const cardFeedsByPolicy: Record<string, CardFeedForDisplay[]> = {
            POLICY_2: [customFeedB, customFeedA],
        };
        const result = getDefaultCardFeed(['POLICY_1', 'POLICY_2'], 'POLICY_1', cardFeedsByPolicy, localeCompare);
        expect(result).toEqual(customFeedA);
    });

    it('falls back to commercial feeds when no eligible policy has feeds', () => {
        const cardFeedsByPolicy: Record<string, CardFeedForDisplay[]> = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '': [commercialFeedZ, commercialFeed],
        };
        const result = getDefaultCardFeed(['POLICY_1'], 'POLICY_1', cardFeedsByPolicy, localeCompare);
        expect(result).toEqual(commercialFeed);
    });

    it('skips the active policy when it is not eligible and uses the first eligible policy instead', () => {
        const cardFeedsByPolicy: Record<string, CardFeedForDisplay[]> = {
            POLICY_1: [customFeedB],
            POLICY_2: [customFeedA],
        };
        // POLICY_1 is active but not in the eligible list
        const result = getDefaultCardFeed(['POLICY_2'], 'POLICY_1', cardFeedsByPolicy, localeCompare);
        expect(result).toEqual(customFeedA);
    });

    it('returns undefined when there are no feeds at all', () => {
        const result = getDefaultCardFeed([], undefined, {}, localeCompare);
        expect(result).toBeUndefined();
    });

    it('returns undefined when eligiblePoliciesIDsArray is undefined', () => {
        const result = getDefaultCardFeed(undefined, undefined, {}, localeCompare);
        expect(result).toBeUndefined();
    });

    it('prefers active policy feed over other eligible policies', () => {
        const cardFeedsByPolicy: Record<string, CardFeedForDisplay[]> = {
            POLICY_1: [customFeedB],
            POLICY_2: [customFeedA],
        };
        const result = getDefaultCardFeed(['POLICY_1', 'POLICY_2'], 'POLICY_1', cardFeedsByPolicy, localeCompare);
        expect(result).toEqual(customFeedB);
    });
});

describe('getActiveExpensifyCardFeedID', () => {
    // Minimal eligible active workspace: paid group, admin/auditor role, non-optional approval mode.
    const eligiblePolicy: Policy = {
        ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM),
        role: CONST.POLICY.ROLE.ADMIN,
        approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        policyAccountID: 900,
    };

    // The resolver only reads `fundID` off each entry.
    const primaryFeed = (fundID: number): ExpensifyCardFeedEntry => ({settingsKey: `expensifyCardSettings_${fundID}`, fundID, settings: {} as ExpensifyCardSettings});

    // Display feeds carry a string `fundID` and the `id` the resolver returns.
    const expensifyFeed = (fundID: string): CardFeedForDisplay => ({id: `${fundID}_Expensify Card`, feed: 'Expensify Card' as CardFeedForDisplay['feed'], fundID, name: 'Expensify Card'});

    describe('precedence', () => {
        it('prefers the primary feed over the preferred-policy fund and the workspace account', () => {
            const feeds = [expensifyFeed('100'), expensifyFeed('200'), expensifyFeed('900')];
            const result = getActiveExpensifyCardFeedID(eligiblePolicy, [primaryFeed(100)], 200, 900, feeds);
            expect(result).toBe('100_Expensify Card');
        });

        it('falls back to the preferred-policy fund when there is no primary feed', () => {
            const feeds = [expensifyFeed('200'), expensifyFeed('900')];
            const result = getActiveExpensifyCardFeedID(eligiblePolicy, [], 200, 900, feeds);
            expect(result).toBe('200_Expensify Card');
        });

        it('falls back to the workspace account ID when no primary or preferred-policy feed maps', () => {
            const feeds = [expensifyFeed('900')];
            const result = getActiveExpensifyCardFeedID(eligiblePolicy, [], undefined, 900, feeds);
            expect(result).toBe('900_Expensify Card');
        });

        it('skips a candidate fund that has no matching display feed and uses the next candidate', () => {
            // Primary fund 100 has no display feed, so resolution falls through to the preferred-policy fund 200.
            const feeds = [expensifyFeed('200')];
            const result = getActiveExpensifyCardFeedID(eligiblePolicy, [primaryFeed(100)], 200, 900, feeds);
            expect(result).toBe('200_Expensify Card');
        });

        it('picks the lowest fundID deterministically when the policy has multiple primary feeds', () => {
            const feeds = [expensifyFeed('300'), expensifyFeed('100'), expensifyFeed('200')];
            const result = getActiveExpensifyCardFeedID(eligiblePolicy, [primaryFeed(300), primaryFeed(100), primaryFeed(200)], undefined, undefined, feeds);
            expect(result).toBe('100_Expensify Card');
        });

        it('resolves the feed for an auditor on an eligible workspace', () => {
            const feeds = [expensifyFeed('100')];
            const auditorPolicy: Policy = {...eligiblePolicy, role: CONST.POLICY.ROLE.AUDITOR};
            expect(getActiveExpensifyCardFeedID(auditorPolicy, [primaryFeed(100)], undefined, undefined, feeds)).toBe('100_Expensify Card');
        });

        it('returns undefined when the eligible workspace has no matching Expensify Card feed', () => {
            const feeds = [expensifyFeed('999')];
            const result = getActiveExpensifyCardFeedID(eligiblePolicy, [primaryFeed(100)], 200, 900, feeds);
            expect(result).toBeUndefined();
        });
    });

    describe('eligibility gate', () => {
        it('returns undefined when the active policy role is not admin or auditor', () => {
            const feeds = [expensifyFeed('100')];
            const memberPolicy: Policy = {...eligiblePolicy, role: CONST.POLICY.ROLE.USER};
            expect(getActiveExpensifyCardFeedID(memberPolicy, [primaryFeed(100)], undefined, undefined, feeds)).toBeUndefined();
        });

        it('returns undefined when the active policy approval mode is optional', () => {
            const feeds = [expensifyFeed('100')];
            const optionalPolicy: Policy = {...eligiblePolicy, approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL};
            expect(getActiveExpensifyCardFeedID(optionalPolicy, [primaryFeed(100)], undefined, undefined, feeds)).toBeUndefined();
        });

        it('returns undefined when the active policy is not a paid group policy', () => {
            const feeds = [expensifyFeed('100')];
            const personalPolicy: Policy = {...eligiblePolicy, type: CONST.POLICY.TYPE.PERSONAL};
            expect(getActiveExpensifyCardFeedID(personalPolicy, [primaryFeed(100)], undefined, undefined, feeds)).toBeUndefined();
        });

        it('returns undefined when there is no active policy', () => {
            expect(getActiveExpensifyCardFeedID(undefined, [], undefined, undefined, [])).toBeUndefined();
        });
    });
});
