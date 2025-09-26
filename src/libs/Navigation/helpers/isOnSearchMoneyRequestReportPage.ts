import {getRootState} from '@libs/Navigation/navigationRef';
import SCREENS from '@src/SCREENS';

const isOnSearchMoneyRequestReportPage = (): boolean => {
    const rootState = getRootState();
    if (!rootState) {
        return false;
    }

    const lastRootRoute = rootState.routes.at(-1);
    const lastNestedRoute = lastRootRoute?.state?.routes?.at(-1);
    return lastNestedRoute?.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT;
};

export default isOnSearchMoneyRequestReportPage;
