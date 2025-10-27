import {CommonActions} from '@react-navigation/native';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

// The search report screen is preloaded before navigating to avoid lag when opening the page. If the content is rendered in the background and then navigated, the opening experience is smoother.
export default function openSearchReport(reportID: string | undefined, backTo: string) {
    navigationRef.dispatch({
        ...CommonActions.preload(NAVIGATORS.RIGHT_MODAL_NAVIGATOR, {
            name: SCREENS.RIGHT_MODAL.SEARCH_REPORT,
            params: {reportID, backTo},
        }),
        target: navigationRef.getRootState().key,
    });
    requestAnimationFrame(() => Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo})));
}
