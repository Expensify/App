import {useIsFocused} from '@react-navigation/native';

/**
 * Reports whether the screen is covered right now: either another screen of its own navigator sits on top of it, or
 * the whole navigator lost focus to a route higher in the tree. useIsFocused is chain-aware, so e.g. the search
 * expense list counts as covered while an RHP is open on top of it.
 *
 * This follows the navigation state with no delay in either direction, which is what the accessibility state of a
 * screen has to do. The Activity mode cannot be used for it, because it defers a reveal until the navigation
 * transition ends, and a screen the user is already looking at must not stay out of the accessibility tree and the
 * tab order for the length of an animation. React Navigation 8 derives its `inert` flag the same way, from the
 * focus state rather than from the (delayed) mode it hands to <Activity>.
 */
function useIsScreenCovered(isScreenBlurred: boolean): boolean {
    const isFocused = useIsFocused();
    return isScreenBlurred || !isFocused;
}

export default useIsScreenCovered;
