import CONST from '@src/CONST';
import type {ThemeStyles} from '@src/styles';
import type {ThemeColors} from '@src/styles/theme/types';
import createStyleUtils from '@src/styles/utils';

const mockTheme = {} as ThemeColors;

const mockStyles = {
    buttonExtraSmall: {height: 28},
    buttonSmall: {height: 32},
    buttonMedium: {height: 40},
    buttonLarge: {height: 48},
    ph0: {paddingHorizontal: 0},
    pl2: {paddingLeft: 8},
    pr2: {paddingRight: 8},
    pl3: {paddingLeft: 12},
    pr3: {paddingRight: 12},
    pl4: {paddingLeft: 16},
    pr4: {paddingRight: 16},
    buttonSuccess: {backgroundColor: 'green'},
    buttonDanger: {backgroundColor: 'red'},
    buttonOpacityDisabled: {opacity: 0.5},
    buttonDisabled: {backgroundColor: 'gray'},
} as unknown as ThemeStyles;

const {getButtonSizeStyle, getButtonPaddingStyle, getButtonStyleWithIcon, getButtonVariantStyles} = createStyleUtils(mockTheme, mockStyles);

describe('getButtonSizeStyle', () => {
    it('returns undefined when size is not provided', () => {
        expect(getButtonSizeStyle(mockStyles)).toBeUndefined();
    });

    it.each([
        [CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL, mockStyles.buttonExtraSmall],
        [CONST.DROPDOWN_BUTTON_SIZE.SMALL, mockStyles.buttonSmall],
        [CONST.DROPDOWN_BUTTON_SIZE.MEDIUM, mockStyles.buttonMedium],
        [CONST.DROPDOWN_BUTTON_SIZE.LARGE, mockStyles.buttonLarge],
    ] as const)('returns correct style for size %s', (size, expected) => {
        expect(getButtonSizeStyle(mockStyles, size)).toBe(expected);
    });
});

describe('getButtonPaddingStyle', () => {
    describe('when size is not provided', () => {
        it('returns buttonMedium merged with ph0 when has icon but no text', () => {
            expect(getButtonPaddingStyle(mockStyles, undefined, true, false)).toEqual({...mockStyles.buttonMedium, ...mockStyles.ph0});
        });

        it('returns undefined when there is no icon', () => {
            expect(getButtonPaddingStyle(mockStyles, undefined, false, true)).toBeUndefined();
        });
    });

    describe('when size is provided', () => {
        it('returns undefined when both icons are present (symmetric)', () => {
            expect(getButtonPaddingStyle(mockStyles, CONST.DROPDOWN_BUTTON_SIZE.MEDIUM, true, true, true)).toBeUndefined();
        });

        it('returns undefined when both icons are absent (symmetric)', () => {
            expect(getButtonPaddingStyle(mockStyles, CONST.DROPDOWN_BUTTON_SIZE.MEDIUM, false, true, false)).toBeUndefined();
        });

        it('returns undefined when both icon flags are undefined (symmetric)', () => {
            expect(getButtonPaddingStyle(mockStyles, CONST.DROPDOWN_BUTTON_SIZE.MEDIUM, undefined, true, undefined)).toBeUndefined();
        });

        it('returns ph0 when icons are asymmetric and there is no text', () => {
            expect(getButtonPaddingStyle(mockStyles, CONST.DROPDOWN_BUTTON_SIZE.MEDIUM, true, false, false)).toBe(mockStyles.ph0);
        });

        it.each([
            [CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL, true, mockStyles.pl2],
            [CONST.DROPDOWN_BUTTON_SIZE.EXTRA_SMALL, false, mockStyles.pr2],
            [CONST.DROPDOWN_BUTTON_SIZE.MEDIUM, true, mockStyles.pl3],
            [CONST.DROPDOWN_BUTTON_SIZE.MEDIUM, false, mockStyles.pr3],
            [CONST.DROPDOWN_BUTTON_SIZE.LARGE, true, mockStyles.pl4],
            [CONST.DROPDOWN_BUTTON_SIZE.LARGE, false, mockStyles.pr4],
        ] as const)('size %s with hasIcon=%s returns correct padding', (size, hasIcon, expected) => {
            const shouldShowRightIcon = !hasIcon;
            expect(getButtonPaddingStyle(mockStyles, size, hasIcon, true, shouldShowRightIcon)).toBe(expected);
        });
    });
});

describe('getButtonStyleWithIcon', () => {
    it('composes size style and padding style into an array', () => {
        expect(getButtonStyleWithIcon(mockStyles, CONST.DROPDOWN_BUTTON_SIZE.MEDIUM, true, true, false)).toEqual([mockStyles.buttonMedium, mockStyles.pl3]);
    });

    it('returns array of undefined values when no arguments are provided', () => {
        expect(getButtonStyleWithIcon(mockStyles)).toEqual([undefined, undefined]);
    });
});

describe('getButtonVariantStyles', () => {
    const variantStyles = getButtonVariantStyles(mockStyles);

    it('returns correct normal variant styles', () => {
        expect(variantStyles.normal).toEqual({
            success: mockStyles.buttonSuccess,
            danger: mockStyles.buttonDanger,
            link: {},
        });
    });

    it('returns correct disabled variant styles', () => {
        expect(variantStyles.disabled).toEqual({
            success: [mockStyles.buttonOpacityDisabled],
            danger: [mockStyles.buttonOpacityDisabled],
            link: [mockStyles.buttonOpacityDisabled, mockStyles.buttonDisabled],
        });
    });
});
