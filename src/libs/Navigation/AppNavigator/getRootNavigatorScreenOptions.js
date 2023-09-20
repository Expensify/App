import modalCardStyleInterpolator from './modalCardStyleInterpolator';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import getNavigationModalCardStyle from '../../../styles/getNavigationModalCardStyles';
import CONFIG from '../../../CONFIG';

const commonScreenOptions = {
    headerShown: false,
    gestureDirection: 'horizontal',
    animationEnabled: true,
    cardOverlayEnabled: true,
    animationTypeForReplace: 'push',
};

export default (isSmallScreenWidth) => ({
    rightModalNavigator: {
        ...commonScreenOptions,
        cardStyleInterpolator: (props) => modalCardStyleInterpolator(isSmallScreenWidth, false, props),
        presentation: 'transparentModal',

        // We want pop in RHP since there are some flows that would work weird otherwise
        animationTypeForReplace: 'pop',
        cardStyle: {
            ...getNavigationModalCardStyle(),

            // This is necessary to cover translated sidebar with overlay.
            width: isSmallScreenWidth ? '100%' : '200%',
            // Excess space should be on the left so we need to position from right.
            right: 0,
        },
    },

    homeScreen: {
        title: CONFIG.SITE_TITLE,
        ...commonScreenOptions,
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
