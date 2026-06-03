import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

/**
 * On iOS, the navigation transition can sometimes break other animations, such as the closing modal.
 * In this case we need to wait for the animation to be complete before executing the navigation
 */
function navigateAfterInteraction(callback: () => void) {
    TransitionTracker.runAfterTransitions({
        callback: () => {
            Navigation.setNavigationActionToMicrotaskQueue(callback);
        },
    });
}

export default navigateAfterInteraction;
