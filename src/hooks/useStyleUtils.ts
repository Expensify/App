import {useThemeStylesActions} from '@components/ThemeStylesContextProvider';

function useStyleUtils() {
    const themeStylesActions = useThemeStylesActions();

    if (!themeStylesActions) {
        throw new Error('ThemeStylesActionsContext was null! Are you sure that you wrapped the component under a <ThemeStylesProvider>?');
    }

    return themeStylesActions.StyleUtils;
}

export default useStyleUtils;
