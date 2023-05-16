import {useContext} from 'react';
import StylesContext from './StylesContext';

function useStyles() {
    const contextValue = useContext(StylesContext);

    if (contextValue == null) {
        throw new Error('StylesContext was null! Are you sure that you wrapped the component under a <StylesProvider>?');
    }

    return contextValue;
}

export default useStyles;
