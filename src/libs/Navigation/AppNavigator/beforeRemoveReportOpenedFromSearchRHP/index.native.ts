import {StackActions} from '@react-navigation/native';
import type {EventArg} from '@react-navigation/native';
import getTopmostBottomTabRoute from '@libs/Navigation/getTopmostBottomTabRoute';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import type {RootStackParamList, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/**
 * When we go back from the chat opened in the Chats section to the chat opened in the Search RHP we have to pop the Home screen from the Bottom tab navigator to display correctly Search page under RHP on native platform.
 * It fixes this issue: https://github.com/Expensify/App/issues/48882
 */
function beforeRemoveReportOpenedFromSearchRHP(event: EventArg<'beforeRemove', true>) {
    if (!navigationRef.current) {
        return;
    }

    const state = navigationRef.current?.getRootState() as State<RootStackParamList>;

    if (!state) {
        return;
    }

    const shouldPopHome =
        state.routes?.length >= 3 &&
        state.routes.at(-1)?.name === SCREENS.REPORT &&
        state.routes.at(-2)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR &&
        getTopmostBottomTabRoute(state)?.name === SCREENS.HOME;

    if (!shouldPopHome) {
        return;
    }

    event.preventDefault();
    const bottomTabState = state?.routes?.at(0)?.state;
    navigationRef.dispatch({...StackActions.pop(), target: bottomTabState?.key});
    Navigation.goBack();
}

export default beforeRemoveReportOpenedFromSearchRHP;
