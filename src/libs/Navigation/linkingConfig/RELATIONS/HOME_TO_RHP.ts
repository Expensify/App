import SCREENS from '@src/SCREENS';

const HOME_TO_RHP: Record<typeof SCREENS.HOME, string[]> = {
    // Transaction/report RHP screens opened from the Recently added slot keep Home underneath.
    // The confirm digital wallet flow is only opened from the Time Sensitive section, so it keeps Home underneath too.
    [SCREENS.HOME]: [
        SCREENS.RIGHT_MODAL.SEARCH_REPORT,
        SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT,
        SCREENS.RIGHT_MODAL.EXPENSE_REPORT,
        SCREENS.SETTINGS.WALLET.CARD_ADD_TO_DIGITAL_WALLET,
    ],
};

export default HOME_TO_RHP;
