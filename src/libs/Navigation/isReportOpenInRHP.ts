import type {NavigationState} from '@react-navigation/native';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const isReportOpenInRHP = (state: NavigationState | undefined): boolean => {
    const lastRoute = state?.routes?.at(-1);
    return !!(lastRoute?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR && lastRoute?.state?.routes?.some((route) => route?.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT));
};

export default isReportOpenInRHP;
