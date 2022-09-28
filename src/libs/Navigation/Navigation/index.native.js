import {InteractionManager} from 'react-native';
import Navigation, {navigationRef} from './BaseNavigation';

let navigationHandle = null;

/**
 * @param {String} reportID
 * @param {Object} navigation
 */
function navigateToChat(reportID, navigation) {
    // navigationHandle = InteractionManager.createInteractionHandle();
    navigation.setParams({reportID: `${reportID}`});
    navigation.closeDrawer();
}

function clearNavigateToChatHandle() {
    InteractionManager.clearInteractionHandle(navigationHandle);
}

Navigation.navigateToChat = navigateToChat;
Navigation.clearNavigateToChatHandle = clearNavigateToChatHandle;

export default Navigation;
export {navigationRef};
