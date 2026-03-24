import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';

type Theme = ValueOf<typeof CONST.THEME>;
type BaseTheme = typeof CONST.THEME.LIGHT | typeof CONST.THEME.DARK | typeof CONST.THEME.SYSTEM;

const CONTRAST_PAIRS: ReadonlyArray<[BaseTheme, Theme]> = [
    [CONST.THEME.LIGHT, CONST.THEME.LIGHT_CONTRAST],
    [CONST.THEME.DARK, CONST.THEME.DARK_CONTRAST],
    [CONST.THEME.SYSTEM, CONST.THEME.SYSTEM_CONTRAST],
];

const BASE_TO_CONTRAST = new Map<string, Theme>(CONTRAST_PAIRS.map(([base, contrast]) => [base, contrast]));
const CONTRAST_TO_BASE = new Map<string, BaseTheme>(CONTRAST_PAIRS.map(([base, contrast]) => [contrast, base]));
const HIGH_CONTRAST_THEMES = new Set<string>(CONTRAST_PAIRS.map(([, contrast]) => contrast));

function getBaseTheme(theme: Theme): BaseTheme {
    return CONTRAST_TO_BASE.get(theme) ?? (theme as BaseTheme);
}

function getContrastTheme(theme: Theme): Theme {
    return BASE_TO_CONTRAST.get(theme) ?? theme;
}

function isHighContrastTheme(theme: Theme): boolean {
    return HIGH_CONTRAST_THEMES.has(theme);
}

export {getBaseTheme, getContrastTheme, isHighContrastTheme};
