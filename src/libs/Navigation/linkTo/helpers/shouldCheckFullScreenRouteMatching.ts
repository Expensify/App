import type {StackNavigationAction} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';

// We need to check if the screen displayed under the overlay matches the contend of modal navigator if we navigate to a modal navigator screen.
// Currently it's only for the RHP because screens in LHP matches to any content.
function shouldCheckFullScreenRouteMatching(action: StackNavigationAction): action is StackNavigationAction & {type: 'PUSH'; payload: {name: typeof NAVIGATORS.RIGHT_MODAL_NAVIGATOR}} {
    return action !== undefined && action.type === 'PUSH' && action.payload.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
}

export default shouldCheckFullScreenRouteMatching;
