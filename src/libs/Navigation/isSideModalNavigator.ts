import NAVIGATORS from '@src/NAVIGATORS';

function isSideModalNavigator(targetNavigator?: string) {
    return targetNavigator === NAVIGATORS.LEFT_MODAL_NAVIGATOR || targetNavigator === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
}

export default isSideModalNavigator;
