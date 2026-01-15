import type {NavigationState} from '@react-navigation/native';
import {SUPER_WIDE_RIGHT_MODALS} from '@components/WideRHPContextProvider/WIDE_RIGHT_MODALS';
import NAVIGATORS from '@src/NAVIGATORS';

const isReportOpenInSuperWideRHP = (state: NavigationState | undefined): boolean => {
    const lastRoute = state?.routes?.at(-1);
    if (!lastRoute) {
        return false;
    }
    return !!(lastRoute.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR && lastRoute.state?.routes?.some((route) => SUPER_WIDE_RIGHT_MODALS.has(route.name)));
};

export default isReportOpenInSuperWideRHP;
