import DeepRecord from '@src/types/utils/DeepRecord';
import defaultTheme from './default';

type ThemeBase = DeepRecord<string, string>;

type ThemeDefault = typeof defaultTheme;

export type {ThemeBase, ThemeDefault};
