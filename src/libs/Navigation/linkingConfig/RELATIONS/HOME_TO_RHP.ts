import SCREENS from '@src/SCREENS';

const HOME_TO_RHP: Record<typeof SCREENS.HOME, string[]> = {
    // Transaction/report RHP screens opened from the Recently added slot keep Home underneath on refresh/deep-link.
    // The Time Sensitive enter-signer-info and email-issue flows keep Home underneath too.
    [SCREENS.HOME]: [
        SCREENS.RIGHT_MODAL.SEARCH_REPORT,
        SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT,
        SCREENS.RIGHT_MODAL.EXPENSE_REPORT,
        SCREENS.REIMBURSEMENT_ACCOUNT_ENTER_SIGNER_INFO,
        SCREENS.SETTINGS.EMAIL_ISSUE,
    ],
};

export default HOME_TO_RHP;
