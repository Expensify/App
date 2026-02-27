import NAVIGATORS from '@src/NAVIGATORS';

function isSideModalNavigator(targetNavigator?: string) {
    return targetNavigator === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
}

export default isSideModalNavigator;
