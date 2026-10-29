import ThemeIllustrationsContext from '@styles/theme/context/ThemeIllustrationsContext';

import {useContext} from 'react';

function useThemeIllustrations() {
    const illustrations = useContext(ThemeIllustrationsContext);

    if (!illustrations) {
        throw new Error('ThemeIllustrationsContext was null! Are you sure that you wrapped the component under a <ThemeIllustrationsProvider>?');
    }

    return illustrations;
}

export default useThemeIllustrations;
