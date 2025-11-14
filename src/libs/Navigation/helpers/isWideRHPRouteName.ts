import SCREENS from '@src/SCREENS';

function isSuperWideRHPRouteName(routeName: string) {
    return routeName === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT || routeName === SCREENS.RIGHT_MODAL.EXPENSE_REPORT;
}

function isWideRHPRouteName(routeName: string) {
    return routeName === SCREENS.RIGHT_MODAL.SEARCH_REPORT;
}

export {isSuperWideRHPRouteName, isWideRHPRouteName};
