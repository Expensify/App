import type {ThemeStylesActionsContextType, ThemeStylesStateContextType} from './types';

// These defaults are never used at runtime — useThemeStyles() and useStyleUtils()
// both throw if the context is null. Using undefined avoids eagerly computing the
// full styles object at module import time, deferring it to ThemeStylesProvider render.
const defaultThemeStylesStateContextValue = undefined as unknown as ThemeStylesStateContextType;

const defaultThemeStylesActionsContextValue = undefined as unknown as ThemeStylesActionsContextType;

export {defaultThemeStylesStateContextValue, defaultThemeStylesActionsContextValue};
