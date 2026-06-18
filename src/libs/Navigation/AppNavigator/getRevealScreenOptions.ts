import Animations from '@libs/Navigation/PlatformStackNavigation/navigationOptions/animation';
import type {PlatformStackNavigationOptions} from '@libs/Navigation/PlatformStackNavigation/types';

/**
 * Params shared by screens/navigators that can be revealed from under an RHP (e.g. the workspace
 * creation flow). When `noEnterAnimation` is set on the route, the screen must skip its enter animation
 * so it does not slide in over the screen beneath it while the RHP is dismissed.
 * See contributingGuides/NAVIGATION.md → "Revealing a newly created screen from under the RHP".
 */
type RevealableUnderRHPParams = {noEnterAnimation?: boolean};

/**
 * Returns `baseOptions` with the enter animation disabled when the screen is being revealed from under an
 * RHP (its route carries `noEnterAnimation`). Everything else from `baseOptions` (notably `gestureEnabled`)
 * is preserved, so iOS swipe-back keeps working.
 */
function getRevealScreenOptions(routeParams: RevealableUnderRHPParams | undefined, baseOptions: PlatformStackNavigationOptions): PlatformStackNavigationOptions {
    if (!routeParams?.noEnterAnimation) {
        return baseOptions;
    }
    return {...baseOptions, animation: Animations.NONE};
}

export default getRevealScreenOptions;
export type {RevealableUnderRHPParams};
