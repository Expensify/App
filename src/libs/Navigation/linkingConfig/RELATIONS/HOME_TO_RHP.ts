import SCREENS from '@src/SCREENS';

const HOME_TO_RHP: Record<typeof SCREENS.HOME, string[]> = {
    // Transaction/report RHP screens opened from the Recently added slot keep Home underneath, and so does the Time Sensitive email-issue flow.
    [SCREENS.HOME]: [SCREENS.RIGHT_MODAL.SEARCH_REPORT, SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT, SCREENS.RIGHT_MODAL.EXPENSE_REPORT, SCREENS.SETTINGS.EMAIL_ISSUE],
};

export default HOME_TO_RHP;
