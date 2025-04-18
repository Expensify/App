import ROUTES from '@src/ROUTES';
import Navigation from './Navigation/Navigation';

const navigateAfterJoinRequest = () => {
    Navigation.goBack(undefined, {shouldPopToTop: true});
    Navigation.setNavigationActionToMicrotaskQueue(() => {
        Navigation.navigate(ROUTES.SETTINGS_WORKSPACES.route);
    });
};
export default navigateAfterJoinRequest;
