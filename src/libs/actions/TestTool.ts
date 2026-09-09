import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import throttle from 'lodash/throttle';

import {close} from './Modal';

/** The focused route carries no backTo once a child screen such as the server selector is on top. */
function getBackToParam(): Route | undefined {
    const modalRoute = navigationRef.current?.getRootState()?.routes.find((route) => route.name === NAVIGATORS.TEST_TOOLS_MODAL_NAVIGATOR);
    const rootScreen = modalRoute?.state?.routes?.find((route) => route.name === SCREENS.TEST_TOOLS_MODAL.ROOT);
    return (rootScreen?.params as {backTo?: Route} | undefined)?.backTo;
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
                return;
            }
            // dismissModal() would not close this modal: the public root is a plain platform stack that never handles DISMISS_MODAL.
            const rootKey = navigationRef.current?.getRootState()?.key;
            if (rootKey) {
                Navigation.pop(rootKey);
            }
            return;
        }
        const isAuthenticated = navigationRef.current?.getRootState()?.routes.some((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
        const backToRoute = isAuthenticated ? Navigation.getActiveRoute() : ROUTES.ROOT;
        const openTestToolsModal = () => {
            setTimeout(() => Navigation.navigate(ROUTES.TEST_TOOLS_MODAL.getRoute(backToRoute)), CONST.MODAL.ANIMATION_TIMING.DEFAULT_IN);
        };
        // The test drive modal needs goBack() to clean up its navigation state; close() alone leaves the URL on onboarding/test-drive with the modal gone, and the app unresponsive.
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

export default toggleTestToolsModal;
