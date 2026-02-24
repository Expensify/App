import ROUTES from '@src/ROUTES';
import Navigation from './Navigation/Navigation';

const navigateAfterJoinRequest = () => {
    Navigation.goBack();
    Navigation.setNavigationActionToMicrotaskQueue(() => {
        Navigation.navigate(ROUTES.WORKSPACES_LIST.route);
    });
};
export default navigateAfterJoinRequest;
