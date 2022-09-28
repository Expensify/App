import ROUTES from '../../../ROUTES';
import Navigation, {navigationRef} from './BaseNavigation';

/**
 * @param {String} reportID
 */
function navigateToChat(reportID) {
    Navigation.navigate(ROUTES.getReportRoute(reportID));
}

Navigation.navigateToChat = navigateToChat;
export default Navigation;
export {navigationRef};
