import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

const navigateAfterJoinRequest = () => {
    Navigation.navigate(ROUTES.ALL_SETTINGS, CONST.NAVIGATION.TYPE.FORCED_UP);
    Navigation.navigate(ROUTES.SETTINGS_WORKSPACES);
};
export default navigateAfterJoinRequest;
