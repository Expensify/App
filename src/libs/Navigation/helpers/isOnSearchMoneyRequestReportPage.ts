import navigationRef from '@libs/Navigation/navigationRef';
import type {RootNavigatorParamList, State} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

const isOnSearchMoneyRequestReportPage = (): boolean => {
    const rootState = navigationRef.isReady() ? (navigationRef.getRootState() as State<RootNavigatorParamList>) : null;
    if (!rootState) {
        return false;
    }

    const lastRootRoute = rootState.routes.at(-1);
    const lastNestedRoute = lastRootRoute?.state?.routes?.at(-1);
    return lastNestedRoute?.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT;
};

export default isOnSearchMoneyRequestReportPage;
