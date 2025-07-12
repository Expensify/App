import throttle from 'lodash/throttle';
import {getBrowser, isChromeIOS} from '@libs/Browser';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {close} from './Modal';

/**
 * Get the backTo parameter from the current test tools modal route
 */
function getBackToParam(): Route | undefined {
    const route = navigationRef.current?.getCurrentRoute();
    if (route?.name === SCREENS.TEST_TOOLS_MODAL.ROOT && route.params) {
        return (route.params as {backTo?: Route}).backTo;
    }
    return undefined;
}

/**
 * Toggle the test tools modal open or closed.
 * Throttle the toggle to make the modal stay open if you accidentally tap an extra time, which is easy to do.
 */
const throttledToggle = throttle(
    () => {
        const currentRoute = Navigation.getActiveRoute();
        const backTo = getBackToParam();

        if (currentRoute.includes(ROUTES.TEST_TOOLS_MODAL.route)) {
            if (backTo) {
                Navigation.goBack(backTo);
            } else {
                Navigation.goBack();
            }
            return;
        }
        const openTestToolsModal = () => {
            setTimeout(() => Navigation.navigate(ROUTES.TEST_TOOLS_MODAL.getRoute(Navigation.getActiveRoute())), CONST.MODAL.ANIMATION_TIMING.DEFAULT_IN);
        };
        // Dismiss any current modal before showing test tools modal
        // We need to handle test drive modal differently using Navigation.goBack() to properly clean up its navigation state
        // Without this, the URL would revert to onboarding/test-drive or onboarding/test-drive/demo while the modal is already dismissed, leading to an unresponsive state
        if (currentRoute.includes('test-drive')) {
            Navigation.goBack();
            openTestToolsModal();
        } else {
            close(() => {
                openTestToolsModal();
            });
        }
    },
    CONST.TIMING.TEST_TOOLS_MODAL_THROTTLE_TIME,
    {leading: true, trailing: false},
);

function toggleTestToolsModal() {
    throttledToggle();
}

function shouldShowProfileTool() {
    const browser = getBrowser();
    const isSafariOrFirefox = browser === CONST.BROWSER.SAFARI || browser === CONST.BROWSER.FIREFOX;

    if (isSafariOrFirefox || isChromeIOS()) {
        return false;
    }
    return true;
}

export {shouldShowProfileTool};
export default toggleTestToolsModal;
