import SCREENS from '@src/SCREENS';

const HOME_TO_RHP: Record<typeof SCREENS.HOME, string[]> = {
    // EXPENSE_REPORT can be opened from the Home tab (the For You "Review"/"Submit" flows). Declaring the
    // relation lets a hard refresh rebuild Home as the background when the route carries no backTo, instead of
    // falling back to the Inbox default. Call sites that pass backTo are unaffected (backTo takes precedence).
    [SCREENS.HOME]: [SCREENS.RIGHT_MODAL.EXPENSE_REPORT],
};

export default HOME_TO_RHP;
