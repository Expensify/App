import {createContext} from 'react';

type ScreenWrapperOfflineIndicatorContextType = {
    /** Whether nested ScreenWrapper components render the offline indicator on small screens. Their `shouldShowOfflineIndicator` prop takes precedence, and it defaults to `true` if both are unset. */
    showOnSmallScreens?: boolean;

    /** Whether nested ScreenWrapper components render the offline indicator on wide screens. Their `shouldShowOfflineIndicatorInWideScreen` prop takes precedence, and it defaults to `false` if both are unset. */
    showOnWideScreens?: boolean;

    /** Whether nested components offset the offline indicator by adding `CONST.OFFLINE_INDICATOR_HEIGHT` to their bottom padding while offline. */
    addSafeAreaPadding?: boolean;
};

const ScreenWrapperOfflineIndicatorContext = createContext<ScreenWrapperOfflineIndicatorContextType>({});

export default ScreenWrapperOfflineIndicatorContext;
