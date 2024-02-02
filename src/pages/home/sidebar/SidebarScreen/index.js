import {useNavigation} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import useWindowDimensions from '@hooks/useWindowDimensions';
import FreezeWrapper from '@libs/Navigation/FreezeWrapper';
import Navigation from '@libs/Navigation/Navigation';
import * as Welcome from '@userActions/Welcome';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import BaseSidebarScreen from './BaseSidebarScreen';
import sidebarPropTypes from './sidebarPropTypes';

function SidebarScreen(props) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const navigation = useNavigation();

    useEffect(() => {
        const navigationState = navigation.getState();
        const routes = navigationState.routes;
        const currentRoute = routes[navigationState.index];
        if (currentRoute && NAVIGATORS.BOTTOM_TAB_NAVIGATOR !== currentRoute.name) {
            return;
        }

        Welcome.show(routes, () => Navigation.navigate(ROUTES.ONBOARD));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.isLoadingApp]);

    return (
        <FreezeWrapper keepVisible={!isSmallScreenWidth}>
            <BaseSidebarScreen
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </FreezeWrapper>
    );
}

SidebarScreen.propTypes = sidebarPropTypes;
SidebarScreen.displayName = 'SidebarScreen';

export default withOnyx({
    isLoadingApp: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
})(SidebarScreen);
