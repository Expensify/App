import {ThemePreferenceWithoutSystem} from './types';
import useThemePreference from './useThemePreference';

const useThemePreferenceWithStaticOverride = (staticThemePreference: ThemePreferenceWithoutSystem | undefined) => {
    const dynamicThemePreference = useThemePreference();

    // If the "theme" prop is provided, we'll want to use a hardcoded/static theme instead of the currently selected dynamic theme
    // This is used for example on the "SignInPage", because it should always display in dark mode.
    const themePreference = staticThemePreference ?? dynamicThemePreference;

    return themePreference;
};

export default useThemePreferenceWithStaticOverride;
