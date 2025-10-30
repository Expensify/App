import Log from '@libs/Log';
import navigationRef from '@libs/Navigation/navigationRef';
import SCREENS from '@src/SCREENS';

const isOnSearchMoneyRequestReportPage = (): boolean => {
    if (!navigationRef.isReady()) {
        Log.warn('[src/libs/Navigation/helpers/isOnSearchMoneyRequestReportPage.ts] NavigationRef is not ready. Returning false.');
        return false;
    }

    const rootState = navigationRef.getRootState();

    if (!rootState) {
        return false;
    }

    const lastRootRoute = rootState.routes.at(-1);
    const lastNestedRoute = lastRootRoute?.state?.routes?.at(-1);
    return lastNestedRoute?.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT;
};

export default isOnSearchMoneyRequestReportPage;
