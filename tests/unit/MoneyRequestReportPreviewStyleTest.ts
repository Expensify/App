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
            const styles = getMoneyRequestReportPreviewStyle(false, count, 882, 882);

            expect(StyleSheet.flatten(styles.componentStyle)).toEqual({width: expectedWidth, maxWidth: '100%'});
            expect(styles.transactionPreviewCarouselStyle.width).toBe(303);
        });

        it('retains full-width narrow previews and the next-card peek', () => {
            const styles = getMoneyRequestReportPreviewStyle(true, 2, 280, 280);

            expect(StyleSheet.flatten(styles.componentStyle)).toEqual({width: '100%', maxWidth: '100%'});
            expect(styles.transactionPreviewCarouselStyle.width).toBe(232);
        });
    });

    it('retains intrinsic web sizing and its available-width fallback', () => {
        jest.replaceProperty(Platform, 'OS', 'web');
        jest.spyOn(Platform, 'select').mockImplementation((specifics) => specifics.web);

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
