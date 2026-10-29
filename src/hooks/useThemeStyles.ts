import {useThemeStylesState} from '@components/ThemeStylesContextProvider';

function useThemeStyles() {
    const themeStylesState = useThemeStylesState();

    if (!themeStylesState) {
        throw new Error('ThemeStylesStateContext was null! Are you sure that you wrapped the component under a <ThemeStylesProvider>?');
    }

    return themeStylesState.styles;
}

export default useThemeStyles;
