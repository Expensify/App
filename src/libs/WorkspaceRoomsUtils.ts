import type {OnyxEntry} from 'react-native-onyx';
import {navigationRef} from '@libs/Navigation/Navigation';
import type {RootNavigatorParamList, State} from '@libs/Navigation/types';
import {isChatRoom} from '@libs/ReportUtils';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

function shouldShowGoToRoom(report: OnyxEntry<Report>): boolean {
    if (!isChatRoom(report)) {
        return false;
    }
    const rootState = navigationRef.getRootState() as State<RootNavigatorParamList> | undefined;
    if (!rootState) {
        return true;
    }
    const routeBeforeRHP = rootState.routes.at(-2);
    const lastNestedRoute = routeBeforeRHP?.state?.routes?.at(-1);
    return lastNestedRoute?.name !== SCREENS.REPORT;
}

export {shouldShowGoToRoom};
