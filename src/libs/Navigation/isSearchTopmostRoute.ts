import SCREENS from '@src/SCREENS';
import {navigationRef} from './Navigation';
import type {RootStackParamList, State} from './types';

const isSearchTopmostRoute = (): boolean => {
    const rootState = navigationRef.getRootState() as State<RootStackParamList>;

    if (!rootState) {
        return false;
    }

    return rootState.routes.at(-1)?.name === SCREENS.SEARCH.CENTRAL_PANE;
};

export default isSearchTopmostRoute;
