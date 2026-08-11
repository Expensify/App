import CONST from '@src/CONST';
import type {ThemeStyles} from '@src/styles';
import type {ThemeColors} from '@src/styles/theme/types';
import createStyleUtils from '@src/styles/utils';
import variables from '@src/styles/variables';

const mockTheme = {componentBG: '#ffffff'} as ThemeColors;

const mockStyles = {
    timePickerWidth72: {width: 72},
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
} as unknown as ThemeStyles;

const {getButtonSizeStyle, getButtonPaddingStyle, getButtonStyleWithIcon, getButtonVariantStyles, getReportTableColumnStyles, getStatusAMandPMButtonStyle} = createStyleUtils(
    mockTheme,
    mockStyles,
);

describe('getButtonSizeStyle', () => {
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

describe('getButtonStyleWithIcon', () => {
    it('composes size style and padding style into an array', () => {
        expect(getButtonStyleWithIcon(mockStyles, CONST.DROPDOWN_BUTTON_SIZE.MEDIUM, true, true, false)).toEqual([mockStyles.buttonMedium, mockStyles.pl3]);
    });
});

describe('getButtonVariantStyles', () => {
    const variantStyles = getButtonVariantStyles(mockStyles);

    it('returns correct normal variant styles', () => {
        expect(variantStyles.normal).toEqual({
            success: mockStyles.buttonSuccess,
            danger: mockStyles.buttonDanger,
        });
    });

    it('returns correct disabled variant styles', () => {
        expect(variantStyles.disabled).toEqual({
            success: [mockStyles.buttonOpacityDisabled],
            danger: [mockStyles.buttonOpacityDisabled],
        });
    });
});

describe('getReportTableColumnStyles - First approved column width', () => {
    it('uses a fixed wide width (fits the long header and a past-year date, so no year-based widening)', () => {
        expect(getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.FIRST_APPROVED)).toEqual({width: variables.w102});
    });
});

describe('getStatusAMandPMButtonStyle', () => {
    // When a button is highlighted its computed style is an empty object (no background override); when it is not,
    // the componentBG background is applied.
    const highlighted = [mockStyles.timePickerWidth72, {}];
    const dimmed = [mockStyles.timePickerWidth72, {backgroundColor: mockTheme.componentBG}];

    it('highlights PM for the English CONST.TIME_PERIOD marker', () => {
        const {styleForAM, styleForPM} = getStatusAMandPMButtonStyle(CONST.TIME_PERIOD.PM, 'AM', 'PM');
        expect(styleForPM).toEqual(highlighted);
        expect(styleForAM).toEqual(dimmed);
    });

    it('highlights AM for the English CONST.TIME_PERIOD marker', () => {
        const {styleForAM, styleForPM} = getStatusAMandPMButtonStyle(CONST.TIME_PERIOD.AM, 'AM', 'PM');
        expect(styleForAM).toEqual(highlighted);
        expect(styleForPM).toEqual(dimmed);
    });

    // Regression test for the localized AM/PM bug: the saved time yields a localized period marker (Japanese "午後"),
    // which must still highlight the PM button by matching the localized `common.pm` label.
    it('highlights PM for a localized period marker (ja "午後")', () => {
        const {styleForAM, styleForPM} = getStatusAMandPMButtonStyle('午後', '午前', '午後');
        expect(styleForPM).toEqual(highlighted);
        expect(styleForAM).toEqual(dimmed);
    });

    it('highlights AM for a localized period marker (ja "午前")', () => {
        const {styleForAM, styleForPM} = getStatusAMandPMButtonStyle('午前', '午前', '午後');
        expect(styleForAM).toEqual(highlighted);
        expect(styleForPM).toEqual(dimmed);
    });
});
