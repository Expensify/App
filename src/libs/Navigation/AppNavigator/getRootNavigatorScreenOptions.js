import getNavigationModalCardStyle from '@styles/getNavigationModalCardStyles';
import styles from '@styles/styles';
import variables from '@styles/variables';
import CONFIG from '@src/CONFIG';
import modalCardStyleInterpolator from './modalCardStyleInterpolator';

const commonScreenOptions = {
    headerShown: false,
    gestureDirection: 'horizontal',
    animationEnabled: true,
    cardOverlayEnabled: true,
    animationTypeForReplace: 'push',
};

export default (shouldUseNarrowLayout) => ({
    rightModalNavigator: {
        ...commonScreenOptions,
        cardStyleInterpolator: (props) => modalCardStyleInterpolator(shouldUseNarrowLayout, false, props),
        presentation: 'transparentModal',

        // We want pop in RHP since there are some flows that would work weird otherwise
        animationTypeForReplace: 'pop',
        cardStyle: {
            ...getNavigationModalCardStyle(),

            // This is necessary to cover translated sidebar with overlay.
            width: shouldUseNarrowLayout ? '100%' : '200%',
            // Excess space should be on the left so we need to position from right.
            right: 0,
        },
    },

    homeScreen: {
        title: CONFIG.SITE_TITLE,
        ...commonScreenOptions,
        cardStyleInterpolator: (props) => modalCardStyleInterpolator(shouldUseNarrowLayout, false, props),

        cardStyle: {
            ...getNavigationModalCardStyle(),
            width: shouldUseNarrowLayout ? '100%' : variables.sideBarWidth,

            // We need to translate the sidebar to not be covered by the StackNavigator so it can be clickable.
            transform: [{translateX: shouldUseNarrowLayout ? 0 : -variables.sideBarWidth}],
            ...(shouldUseNarrowLayout ? {} : styles.borderRight),
        },
    },
    // eslint-disable-next-line rulesdir/no-negated-variables
    fullScreen: {
        ...commonScreenOptions,
        cardStyleInterpolator: (props) => modalCardStyleInterpolator(shouldUseNarrowLayout, true, props),
        cardStyle: {
            ...getNavigationModalCardStyle(),

            // This is necessary to cover whole screen. Including translated sidebar.
            marginLeft: shouldUseNarrowLayout ? 0 : -variables.sideBarWidth,
        },
    },

    centralPaneNavigator: {
        title: CONFIG.SITE_TITLE,
        ...commonScreenOptions,
        animationEnabled: shouldUseNarrowLayout,
        cardStyleInterpolator: (props) => modalCardStyleInterpolator(shouldUseNarrowLayout, true, props),

        cardStyle: {
            ...getNavigationModalCardStyle(),
            paddingRight: shouldUseNarrowLayout ? 0 : variables.sideBarWidth,
        },
    },
});
