import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';

const navigateAfterJoinRequest = () => {
    // @TODO: Check if this method works the same as on the main branch
    Navigation.goBack(undefined, true);
    Navigation.navigate(ROUTES.SETTINGS);
    Navigation.navigate(ROUTES.SETTINGS_WORKSPACES);
};
export default navigateAfterJoinRequest;
