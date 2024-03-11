import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';
import CONST from "@src/CONST";

const navigateAfterJoinRequest = () => {
    Navigation.navigate(ROUTES.ALL_SETTINGS, CONST.NAVIGATION.TYPE.FORCED_UP);
    Navigation.navigate(ROUTES.SETTINGS_WORKSPACES);
};
export default navigateAfterJoinRequest;
