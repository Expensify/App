import {renderHook} from '@testing-library/react-native';

import Illustrations from '@components/Icon/chunks/illustrations.chunk';

import useThemeIllustrations from '@hooks/useThemeIllustrations';

import {getCardFeedIcon} from '@libs/CardUtils';

import CONST from '@src/CONST';

describe('getCardFeedIcon', () => {
    it('returns the generic asset for undefined bank text', () => {
        // Given a missing bank has no specific company asset.
        const feed = undefined;
        const {result} = renderHook(() => useThemeIllustrations());
        // When the resolver handles the missing bank without inventing a feed name.
        const illustration = getCardFeedIcon(feed, result.current, Illustrations);
        // Then the generic asset keeps cards without a bank recognizable.
        expect(illustration).toBe(result.current.GenericCompanyCardLarge);
    });

    it('returns the generic asset for empty bank text', () => {
        // Given an empty stored bank has no matching company feed.
        const feed = '';
        const {result} = renderHook(() => useThemeIllustrations());
        // When the resolver receives the empty value without normalization.
        const illustration = getCardFeedIcon(feed, result.current, Illustrations);
        // Then the generic asset remains the fallback for an empty bank.
        expect(illustration).toBe(result.current.GenericCompanyCardLarge);
    });

    it('keeps Expensify prefix precedence over CSV infixes', () => {
        // Given an Expensify program feed can also contain text used by CSV imports.
        const feed = `${CONST.EXPENSIFY_CARD.BANK} TRAVEL_US ${CONST.COMPANY_CARD.FEED_BANK_NAME.CSV}`;
        const {result} = renderHook(() => useThemeIllustrations());
        // When the resolver receives bank text that could match both branches.
        const illustration = getCardFeedIcon(feed, result.current, Illustrations);
        // Then the Expensify asset preserves program identity before the CSV fallback.
        expect(illustration).toBe(Illustrations.ExpensifyCardImage);
    });

    it('retains numbered Visa prefix variants', () => {
        // Given OldDot stored numbered Visa feed variants such as vcf3.
        const feed = `${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}3`;
        const {result} = renderHook(() => useThemeIllustrations());
        // When the resolver receives the stored variant without stripping its suffix.
        const illustration = getCardFeedIcon(feed, result.current, Illustrations);
        // Then the Visa asset preserves the identity of the legacy feed.
        expect(illustration).toBe(Illustrations.VisaCompanyCardDetailLarge);
    });

    it('returns the generic asset for __proto__ bank text', () => {
        // Given stored bank text can equal __proto__, an inherited property name rather than a company feed.
        const feed = '__proto__';
        const {result} = renderHook(() => useThemeIllustrations());
        // When the resolver receives that raw value without narrowing the supported bank input.
        const illustration = getCardFeedIcon(feed, result.current, Illustrations);
        // Then the generic asset keeps the inherited prototype from reaching the card icon.
        expect(illustration).toBe(result.current.GenericCompanyCardLarge);
    });

    it('returns the generic asset for constructor bank text', () => {
        // Given stored bank text can equal constructor, an inherited property name rather than a company feed.
        const feed = 'constructor';
        const {result} = renderHook(() => useThemeIllustrations());
        // When the resolver receives that raw value without narrowing the supported bank input.
        const illustration = getCardFeedIcon(feed, result.current, Illustrations);
        // Then the generic asset keeps the inherited constructor from reaching the card icon.
        expect(illustration).toBe(result.current.GenericCompanyCardLarge);
    });
});
