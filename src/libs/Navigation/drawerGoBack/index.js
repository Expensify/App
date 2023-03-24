import Navigation from '../Navigation';

/**
 * @private
 * @param {string} backRoute
 */
export default function drawerGoBack(backRoute) {
    if (!backRoute) {
        Navigation.goBack();
        return;
    }
    Navigation.navigate(backRoute);
}
