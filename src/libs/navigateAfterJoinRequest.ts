import ROUTES from '@src/ROUTES';
import Navigation from './Navigation/Navigation';

const navigateAfterJoinRequest = () => {
    if (Navigation.getShouldPopToSidebar()) {
        Navigation.popToSidebar();
    } else {
        Navigation.goBack();
    }
    Navigation.setNavigationActionToMicrotaskQueue(() => {
        Navigation.navigate(ROUTES.SETTINGS_WORKSPACES.route);
    });
};
export default navigateAfterJoinRequest;
