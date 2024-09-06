import NAVIGATORS from '@src/NAVIGATORS';
import navigationRef from './navigationRef';

const isLastRouteRHP = (): boolean => {
    if (!navigationRef.isReady()) {
        return false;
    }
    const state = navigationRef.getState();


    const lastRoute = state.routes.at(-1);
    return lastRoute?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
};

export default isLastRouteRHP;
