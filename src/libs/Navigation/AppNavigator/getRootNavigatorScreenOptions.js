import modalCardStyleInterpolator from './modalCardStyleInterpolator';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import getNavigationModalCardStyle from '../../../styles/getNavigationModalCardStyles';
import CONFIG from '../../../CONFIG';
import getRightModalNavigatorOptions from './getRightModalNavigatorOptions';

const commonScreenOptions = {
    headerShown: false,
    gestureDirection: 'horizontal',
    animationEnabled: true,
    cardOverlayEnabled: true,
    animationTypeForReplace: 'push',
    animation: 'slide_from_right',
};

export default (isSmallScreenWidth) => ({
    rightModalNavigator: {
        ...commonScreenOptions,
        ...getRightModalNavigatorOptions(isSmallScreenWidth),
    },

    homeScreen: {
        title: CONFIG.SITE_TITLE,
        ...commonScreenOptions,
        // Note: The card* properties won't be applied on mobile platforms, as they use the native defaults.
        cardStyleInterpolator: (props) => modalCardStyleInterpolator(isSmallScreenWidth, false, props),
        cardStyle: {
            ...getNavigationModalCardStyle(),
            width: isSmallScreenWidth ? '100%' : variables.sideBarWidth,

            // We need to translate the sidebar to not be covered by the StackNavigator so it can be clickable.
            transform: [{translateX: isSmallScreenWidth ? 0 : -variables.sideBarWidth}],
            ...(isSmallScreenWidth ? {} : styles.borderRight),
        },
    },
    // eslint-disable-next-line rulesdir/no-negated-variables
    fullScreen: {
        ...commonScreenOptions,

        cardStyleInterpolator: (props) => modalCardStyleInterpolator(isSmallScreenWidth, true, props),
        cardStyle: {
            ...getNavigationModalCardStyle(),

            // This is necessary to cover whole screen. Including translated sidebar.
            marginLeft: isSmallScreenWidth ? 0 : -variables.sideBarWidth,
        },
    },

    centralPaneNavigator: {
        title: CONFIG.SITE_TITLE,
        ...commonScreenOptions,
        animationEnabled: isSmallScreenWidth,

        cardStyleInterpolator: (props) => modalCardStyleInterpolator(isSmallScreenWidth, true, props),
        cardStyle: {
            ...getNavigationModalCardStyle(),
            paddingRight: isSmallScreenWidth ? 0 : variables.sideBarWidth,
        },
    },
});
