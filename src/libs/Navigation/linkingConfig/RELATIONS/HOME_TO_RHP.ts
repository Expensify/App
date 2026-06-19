import SCREENS from '@src/SCREENS';

const HOME_TO_RHP: Record<typeof SCREENS.HOME, string[]> = {
    // Transaction/report RHP screens opened from the Recently added slot keep Home underneath on refresh/deep-link.
    // EXPENSE_REPORT is included so a hard refresh on the Home tab "Review"/"Submit" flows rebuilds Home as the
    // background when the route carries no backTo, instead of falling back to the Inbox default. Call sites that
    // pass backTo are unaffected (backTo takes precedence).
    [SCREENS.HOME]: [SCREENS.RIGHT_MODAL.SEARCH_REPORT, SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT, SCREENS.RIGHT_MODAL.EXPENSE_REPORT],
};

export default HOME_TO_RHP;
