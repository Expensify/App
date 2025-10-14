import {CommonActions} from '@react-navigation/native';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

export default function openSearchReport(reportID: string, backTo: string) {
    navigationRef.dispatch({
        ...CommonActions.preload(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, {
            name: SCREENS.RIGHT_MODAL.SEARCH_REPORT,
            params: {reportID, backTo},
        }),
        target: navigationRef.getRootState().key,
    });
    requestAnimationFrame(() => Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo})));
}
