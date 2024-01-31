import {useNavigation} from '@react-navigation/native';
import React, {useEffect} from 'react';
import useWindowDimensions from '@hooks/useWindowDimensions';
import FreezeWrapper from '@libs/Navigation/FreezeWrapper';
import Navigation from '@libs/Navigation/Navigation';
import * as Welcome from '@userActions/Welcome';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import BaseSidebarScreen from './BaseSidebarScreen';
import FloatingActionButtonAndPopover from './FloatingActionButtonAndPopover';
import sidebarPropTypes from './sidebarPropTypes';

function SidebarScreen(props) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const navigation = useNavigation();

    useEffect(() => {
        const navigationState = navigation.getState();
        const routes = navigationState.routes;
        const currentRoute = routes[navigationState.index];
        if (currentRoute && NAVIGATORS.CENTRAL_PANE_NAVIGATOR !== currentRoute.name && currentRoute.name !== SCREENS.HOME) {
            return;
        }
        Welcome.show(routes, () => Navigation.navigate(ROUTES.ONBOARD));
    }, []);

    return (
        <FreezeWrapper keepVisible={!isSmallScreenWidth}>
            <BaseSidebarScreen
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            >
                <FloatingActionButtonAndPopover />
            </BaseSidebarScreen>
        </FreezeWrapper>
    );
}

SidebarScreen.propTypes = sidebarPropTypes;
SidebarScreen.displayName = 'SidebarScreen';

export default SidebarScreen;
