import {useContext} from 'react';
import ThemeStylesContext from './ThemeStylesContext';

function useStyleUtils() {
    const themeStyleContext = useContext(ThemeStylesContext);

    if (!themeStyleContext) {
        throw new Error('ThemeStylesContext was null! Are you sure that you wrapped the component under a <ThemeStylesProvider>?');
    }

    return themeStyleContext.ThemeStyleUtils;
}

export default useStyleUtils;
