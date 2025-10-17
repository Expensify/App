import {useContext} from 'react';
import ThemeStylesContext from '@styles/theme/context/ThemeStylesContext';
import type {StyleUtilsType} from '@styles/utils';

function useStyleUtils(): StyleUtilsType {
    const themeStylesContext = useContext(ThemeStylesContext);

    if (!themeStylesContext) {
        throw new Error('ThemeStylesContext was null! Are you sure that you wrapped the component under a <ThemeStylesProvider>?');
    }

    return themeStylesContext.StyleUtils;
}

export default useStyleUtils;
