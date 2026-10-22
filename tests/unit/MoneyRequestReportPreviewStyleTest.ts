// Test the pure sizing utility without mounting theme providers.
// eslint-disable-next-line no-restricted-imports
import getMoneyRequestReportPreviewStyle from '@styles/utils/getMoneyRequestReportPreviewStyle';

import {Platform, StyleSheet} from 'react-native';

describe('Money request report preview sizing', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe.each(['ios', 'android'] as const)('%s', (platform) => {
        beforeEach(() => {
            jest.replaceProperty(Platform, 'OS', platform);
        });

        it.each([
            [0, 335],
            [1, 335],
            [2, 646],
            [3, 680],
            [20, 680],
        ])('sizes a %i-transaction preview to its contents within the carousel limit', (count, expectedWidth) => {
            // Given native previews cannot rely on web's intrinsic sizing to fit their transaction cards
            // When the transaction count ranges from an empty preview to more cards than the carousel can show
            const styles = getMoneyRequestReportPreviewStyle(false, count, 882, 882);

            // Then preview width must grow with its contents but stop at the carousel limit without stretching individual cards
            expect(StyleSheet.flatten(styles.componentStyle)).toEqual({width: expectedWidth, maxWidth: '100%'});
            expect(styles.transactionPreviewCarouselStyle.width).toBe(303);
        });

        it('retains full-width narrow previews and the next-card peek', () => {
            // Given a narrow pane cannot fit the fixed-width cards used by wide native previews
            // When sizing multiple transactions in that constrained pane
            const styles = getMoneyRequestReportPreviewStyle(true, 2, 280, 280);

            // Then the preview must fill the pane while leaving enough room to hint at the next carousel card
            expect(StyleSheet.flatten(styles.componentStyle)).toEqual({width: '100%', maxWidth: '100%'});
            expect(styles.transactionPreviewCarouselStyle.width).toBe(232);
        });
    });

    it('retains intrinsic web sizing and its available-width fallback', () => {
        // Given web already sizes previews intrinsically and falls back to full width when cards do not fit
        jest.replaceProperty(Platform, 'OS', 'web');
        jest.spyOn(Platform, 'select').mockImplementation((specifics) => specifics.web);

        // When the same multi-card preview is sized for roomy and constrained web panes
        // Then native's explicit widths must not replace either existing web sizing rule
        expect(StyleSheet.flatten(getMoneyRequestReportPreviewStyle(false, 2, 882, 882).componentStyle)).toEqual({
            maxWidth: 'min(662px, 100%)',
            width: 'min-content',
        });
        expect(StyleSheet.flatten(getMoneyRequestReportPreviewStyle(false, 2, 280, 280).componentStyle)).toEqual({
            maxWidth: 'min(662px, 100%)',
            width: '100%',
        });
    });
});
