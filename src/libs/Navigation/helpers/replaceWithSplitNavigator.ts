import type {NavigationPartialRoute, SplitNavigatorBySidebar, SplitNavigatorSidebarScreen} from '@libs/Navigation/types';
import navigationRef from '@navigation/navigationRef';
import CONST from '@src/CONST';

function replaceWithSplitNavigator<T extends SplitNavigatorSidebarScreen>(splitNavigatorState: NavigationPartialRoute<SplitNavigatorBySidebar<T>>) {
    navigationRef.current?.dispatch({
        target: navigationRef.current.getRootState().key,
        payload: splitNavigatorState,
        type: CONST.NAVIGATION.ACTION_TYPE.REPLACE,
    });
}

export default replaceWithSplitNavigator;
