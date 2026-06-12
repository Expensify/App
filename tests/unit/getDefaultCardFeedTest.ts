import {getDefaultCardFeed} from '@hooks/useCardFeedsForDisplay';
import type {CardFeedForDisplay} from '@libs/CardFeedUtils';

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
