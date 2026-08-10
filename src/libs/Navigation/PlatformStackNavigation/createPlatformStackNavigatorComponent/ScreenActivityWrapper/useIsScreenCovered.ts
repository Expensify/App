import {useIsFocused} from '@react-navigation/native';

/**
 * Reports whether the screen is covered right now, which happens in two ways. Another screen of its own navigator
 * sits on top of it, which the caller passes in as isScreenBlurred because only the navigator knows its own top
 * route. Or the whole navigator lost focus to a route higher in the tree, which is what this hook adds. The wrapper
 * runs outside descriptor.render(), so its useIsFocused reads the focus of the navigator rather than of the screen,
 * which covers cases such as the search expense list while an RHP is open on top of it.
 *
 * This follows the navigation state with no delay in either direction, which is what the accessibility state of a
 * screen has to do, so the Activity mode cannot be used for it. That mode defers a reveal until the navigation
 * transition ends, and a screen the user is already looking at must not stay out of the accessibility tree and the
 * tab order for the length of an animation. React Navigation 8 derives its `inert` flag the same way.
 */
function useIsScreenCovered(isScreenBlurred: boolean): boolean {
    const isFocused = useIsFocused();
    return isScreenBlurred || !isFocused;
}

export default useIsScreenCovered;
