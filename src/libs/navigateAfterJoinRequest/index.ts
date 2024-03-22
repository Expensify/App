import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';

const navigateAfterJoinRequest = () => {
    Navigation.goBack(undefined, false, true);
    Navigation.navigate(ROUTES.ALL_SETTINGS);
    Navigation.navigate(ROUTES.SETTINGS_WORKSPACES);
};
export default navigateAfterJoinRequest;
