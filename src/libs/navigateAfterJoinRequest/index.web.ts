import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

const navigateAfterJoinRequest = () => {
    Navigation.navigate(ROUTES.SETTINGS_WORKSPACES, CONST.NAVIGATION.TYPE.FORCED_UP);
};
export default navigateAfterJoinRequest;
