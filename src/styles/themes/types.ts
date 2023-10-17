import DeepRecord from '../../types/utils/DeepRecord';
import defaultTheme from './default';
import SCREENS from '../../SCREENS';

type ScreenNamesWithBackgroundColors =
    | (typeof SCREENS)['HOME']
    | (typeof SCREENS)['SAVE_THE_WORLD']['ROOT']
    | (typeof SCREENS)['SETTINGS']['PREFERENCES']
    | (typeof SCREENS)['SETTINGS']['WORKSPACES']
    | (typeof SCREENS)['SETTINGS']['SECURITY']
    | (typeof SCREENS)['SETTINGS']['STATUS']
    | (typeof SCREENS)['SETTINGS']['ROOT']
    | (typeof SCREENS)['SETTINGS']['WALLET'];

type PageBackgroundColors = Record<ScreenNamesWithBackgroundColors, string>;

type ThemeBase = DeepRecord<string, string>;

type ThemeDefault = typeof defaultTheme;

export type {ThemeBase, ThemeDefault, PageBackgroundColors};
