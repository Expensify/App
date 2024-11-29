/**
 * This type is used to store the timestamp of when the user dismisses a product training ui elements.
 */
type DismissedProductTraining = {
    /**
     * When user dismisses the nudgeMigration Welcome Modal, we store the timestamp here.
     */
    nudgeMigrationWelcomeModal: Date;

    /**
     * When user dismisses the conciergeLHNGBR product training tooltip, we store the timestamp here.
     */
    conciergeLHNGBR: Date;

    /**
     * When user dismisses the renameSavedSearch product training tooltip, we store the timestamp here.
     */
    renameSavedSearch: Date;

    /**
     * When user dismisses the workspaceChatCreate product training tooltip, we store the timestamp here.
     */
    workspaceChatCreate: Date;

    /**
     * When user dismisses the quickActionButton product training tooltip, we store the timestamp here.
     */
    quickActionButton: Date;
};

export default DismissedProductTraining;
