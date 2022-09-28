import Navigation, {navigationRef} from './BaseNavigation';

/**
 * @param {String} reportID
 * @param {Object} navigation
 */
function navigateToChat(reportID, navigation) {
    navigation.setParams({reportID: `${reportID}`});
    navigation.closeDrawer();
}

Navigation.navigateToChat = navigateToChat;

export default Navigation;
export {navigationRef};
