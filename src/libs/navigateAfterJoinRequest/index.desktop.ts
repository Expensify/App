import getIsSmallScreenWidth from '@libs/getIsSmallScreenWidth';
import Navigation from '@navigation/Navigation';
import ROUTES from '@src/ROUTES';

const navigateAfterJoinRequest = () => {
    Navigation.goBack(undefined, false, true);
    if (getIsSmallScreenWidth()) {
        Navigation.navigate(ROUTES.SETTINGS);
    }
    Navigation.navigate(ROUTES.SETTINGS_WORKSPACES);
};
export default navigateAfterJoinRequest;
