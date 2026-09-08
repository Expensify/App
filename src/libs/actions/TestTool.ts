import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import throttle from 'lodash/throttle';

import {close} from './Modal';

/**
 * The backTo lives on the modal's root screen; the focused route carries none once a child screen
 * such as the server selector is on top.
 */
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
            // Without a backTo, goBack() only pops the topmost screen, leaving a pushed child such as the
            // server selector showing the modal it was meant to dismiss.
            Navigation.goBack(backTo ?? ROUTES.ROOT);
            return;
        }
        const isAuthenticated = navigationRef.current?.getRootState()?.routes.some((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
        const backToRoute = isAuthenticated ? Navigation.getActiveRoute() : ROUTES.ROOT;
        const openTestToolsModal = () => {
            setTimeout(() => Navigation.navigate(ROUTES.TEST_TOOLS_MODAL.getRoute(backToRoute)), CONST.MODAL.ANIMATION_TIMING.DEFAULT_IN);
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

export default toggleTestToolsModal;
