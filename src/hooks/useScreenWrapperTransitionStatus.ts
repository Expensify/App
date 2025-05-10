import {useContext} from 'react';
import {ScreenWrapperStatusContext} from '@components/ScreenWrapper';

/**
 * Hook to get the transition status of a screen inside a ScreenWrapper.
 * Use this hook if you can't get the transition status from the ScreenWrapper itself. Usually when ScreenWrapper is used inside TopTabNavigator.
 * @returns `didScreenTransitionEnd` flag to indicate if navigation transition ended.
 */
export default function useScreenWrapperTransitionStatus() {
    const context = useContext(ScreenWrapperStatusContext);

    if (context === undefined) {
        throw new Error("Couldn't find values for screen ScreenWrapper transition status. Are you inside a screen in ScreenWrapper?");
    }

    return {didScreenTransitionEnd: context.didScreenTransitionEnd};
}
