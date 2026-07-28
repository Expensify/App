// eslint-disable-next-line no-restricted-imports
import styles from '@styles/index';
// eslint-disable-next-line no-restricted-imports
import themes from '@styles/theme';
import type {ThemeColors} from '@styles/theme/types';

import CONST from '@src/CONST';

/**
 * Regression tests for https://github.com/Expensify/App/issues/76919 (PR #96618).
 *
 * Links must be distinguishable by more than color in high-contrast themes (WCAG 1.4.1 - Use of Color),
 * so the `link` and `emailLink` styles underline their text when `theme.isHighContrast` is set. In the
 * normal (non-contrast) themes they must stay without an underline.
 */
type NamedTheme = {name: string; theme: ThemeColors};

describe('High contrast link underline styles', () => {
    const highContrastThemes: NamedTheme[] = [
        {name: 'light-contrast', theme: themes[CONST.THEME.LIGHT_CONTRAST]},
        {name: 'dark-contrast', theme: themes[CONST.THEME.DARK_CONTRAST]},
    ];

    const normalThemes: NamedTheme[] = [
        {name: 'light', theme: themes[CONST.THEME.LIGHT]},
        {name: 'dark', theme: themes[CONST.THEME.DARK]},
    ];

    describe('theme.isHighContrast flag', () => {
        it.each(highContrastThemes)('is true for the $name theme', ({theme}) => {
            expect(theme.isHighContrast).toBe(true);
        });

        it.each(normalThemes)('is not set for the $name theme', ({theme}) => {
            expect(theme.isHighContrast).toBeFalsy();
        });
    });

    describe('link style', () => {
        it.each(highContrastThemes)('underlines links in the $name theme', ({theme}) => {
            expect(styles(theme).link.textDecorationLine).toBe('underline');
        });

        it.each(normalThemes)('does not underline links in the $name theme', ({theme}) => {
            expect(styles(theme).link.textDecorationLine).toBe('none');
        });
    });

    describe('emailLink style', () => {
        it.each(highContrastThemes)('underlines email links in the $name theme', ({theme}) => {
            expect(styles(theme).emailLink.textDecorationLine).toBe('underline');
        });

        it.each(normalThemes)('does not underline email links in the $name theme', ({theme}) => {
            expect(styles(theme).emailLink.textDecorationLine).toBe('none');
        });
    });
});
