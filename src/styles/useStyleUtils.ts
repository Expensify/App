import {useContext} from 'react';
import StyleUtilsContext from './StyleUtilsContext';

function useStyleUtils() {
    const styleUtils = useContext(StyleUtilsContext);

    if (!styleUtils) {
        throw new Error('ThemeStylesContext was null! Are you sure that you wrapped the component under a <ThemeStylesProvider>?');
    }

    return styleUtils;
}

export default useStyleUtils;
