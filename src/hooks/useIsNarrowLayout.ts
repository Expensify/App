import {useNavigationState} from '@react-navigation/native';
import getTopmostRouteName from '@libs/Navigation/getTopmostRouteName';
import SCREENS from '@src/SCREENS';
import useWindowDimensions from './useWindowDimensions';

// This hook checks whether narrow layout styles should be applied to the screen.
// SCREENS.SEARCH.REPORT is the screen displaying the chat in RHP, this page should be styled like a page displayed on a small screen.
export default function useIsNarrowLayout() {
    const {isSmallScreenWidth} = useWindowDimensions();
    const activeRoute = useNavigationState(getTopmostRouteName);
    return activeRoute === SCREENS.SEARCH.REPORT || isSmallScreenWidth;
}
