import {StackActions, useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {BackHandler} from 'react-native';
import getTopmostCentralPaneRoute from '@libs/Navigation/getTopmostCentralPaneRoute';
import navigationRef from '@libs/Navigation/navigationRef';
import type {RootStackParamList, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

function useCustomBackHandler() {
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                const rootState = navigationRef.getRootState();

                const bottomTabRoute = rootState.routes.find((route) => route.name === NAVIGATORS.BOTTOM_TAB_NAVIGATOR);
                const centralPaneRouteAfterPop = getTopmostCentralPaneRoute({routes: [rootState.routes.at(-2)]} as State<RootStackParamList>);

                if (bottomTabRoute && bottomTabRoute.state && (!centralPaneRouteAfterPop || centralPaneRouteAfterPop.name !== SCREENS.SEARCH.CENTRAL_PANE)) {
                    navigationRef.dispatch({...StackActions.pop(), target: bottomTabRoute.state.key});
                }
                return false;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => subscription.remove();
        }, []),
    );
}

export default useCustomBackHandler;
