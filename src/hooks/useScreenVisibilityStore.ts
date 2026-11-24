import ScreenVisibilityContext from '@components/ScreenWrapper/ScreenVisibilityContext';

import {useContext} from 'react';

/** This component's screen visibility as a store, to check when acting or wait on without re-rendering. */
export default function useScreenVisibilityStore() {
    return useContext(ScreenVisibilityContext);
}
