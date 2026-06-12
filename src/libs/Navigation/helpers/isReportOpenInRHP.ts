import type {NavigationState} from '@react-navigation/native';
import {ALL_WIDE_RIGHT_MODALS} from '@components/WideRHPContextProvider/WIDE_RIGHT_MODALS';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const isReportOpenInRHP = (state: NavigationState | undefined): boolean => {
    const lastRoute = state?.routes?.at(-1);
    if (!lastRoute) {
        return false;
    }
    const params = lastRoute.params;
    if (params && 'screen' in params && typeof params.screen === 'string' && params.screen === SCREENS.RIGHT_MODAL.SEARCH_REPORT) {
        return true;
    }
    return !!(lastRoute.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR && lastRoute.state?.routes?.some((route) => ALL_WIDE_RIGHT_MODALS.has(route.name)));
};

export default isReportOpenInRHP;
