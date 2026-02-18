import CONST from '@src/CONST';

const {
    CONCIERGE_LHN_GBR,
    RENAME_SAVED_SEARCH,
    SCAN_TEST_TOOLTIP,
    SCAN_TEST_TOOLTIP_MANAGER,
    SCAN_TEST_CONFIRMATION,
    OUTSTANDING_FILTER,
    ACCOUNT_SWITCHER,
    SCAN_TEST_DRIVE_CONFIRMATION,
    MULTI_SCAN_EDUCATIONAL_MODAL,
    GPS_TOOLTIP,
} = CONST.PRODUCT_TRAINING_TOOLTIP_NAMES;

/**
 * This type is used to store the timestamp of when the user dismisses a product training ui elements.
 */
type DismissedProductTrainingElement = {
    /** The timestamp of when the user dismissed the product training element. */
    timestamp: string;

    /** The method of how the user dismissed the product training element, click or x. */
    dismissedMethod: 'click' | 'x';
};
/**
 * This type is used to store the timestamp of when the user dismisses a product training ui elements.
 */
type DismissedProductTraining = {
    /**
     * When user dismisses the nudgeMigration Welcome Modal, we store the timestamp here.
     */
    [CONST.MIGRATED_USER_WELCOME_MODAL]: DismissedProductTrainingElement;

    // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
    // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
    /**
     * When user dismisses the conciergeLHNGBR product training tooltip, we store the timestamp here.
     */
    [CONCIERGE_LHN_GBR]: DismissedProductTrainingElement;

    /**
     * When user dismisses the renameSavedSearch product training tooltip, we store the timestamp here.
     */
    [RENAME_SAVED_SEARCH]: DismissedProductTrainingElement;

    /**
     * When user dismisses the globalCreateTooltip product training tooltip, we store the timestamp here.
     */
    [SCAN_TEST_TOOLTIP]: DismissedProductTrainingElement;

    /**
     * When user dismisses the test manager tooltip product training tooltip, we store the timestamp here.
     */
    [SCAN_TEST_TOOLTIP_MANAGER]: DismissedProductTrainingElement;

    /**
     * When user dismisses the test manager on confirmation page product training tooltip, we store the timestamp here.
     */
    [SCAN_TEST_CONFIRMATION]: DismissedProductTrainingElement;

    /**
     * When user dismisses the outstanding filter product training tooltip, we store the timestamp here.
     */
    [OUTSTANDING_FILTER]: DismissedProductTrainingElement;

    /**
     * When user dismisses the accountSwitcher product training tooltip, we store the timestamp here.
     */
    [ACCOUNT_SWITCHER]: DismissedProductTrainingElement;

    /**
     * When user dismisses the test drive on confirmation page product training tooltip, we store the timestamp here.
     */
    [SCAN_TEST_DRIVE_CONFIRMATION]: DismissedProductTrainingElement;

    /**
     * When user dismisses the MultiScan product training tooltip, we store the timestamp here.
     */
    [MULTI_SCAN_EDUCATIONAL_MODAL]: DismissedProductTrainingElement;

    /**
     * When user dismisses the ChangeReportPolicy feature training modal, we store the timestamp here.
     */
    [CONST.CHANGE_POLICY_TRAINING_MODAL]: DismissedProductTrainingElement;

    /**
     * When user dismisses the GPS tooltip, we store the timestamp here.
     */
    [GPS_TOOLTIP]: DismissedProductTrainingElement;
};

export default DismissedProductTraining;
