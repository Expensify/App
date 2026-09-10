type UseSyncModalWithHistoryParams = {
    /** Whether the modal is currently visible */
    isVisible: boolean;

    /** Whether this modal participates in browser-history back handling */
    shouldHandleNavigationBack?: boolean;

    /** Called when a browser Back press removes this modal's history entry */
    onClose?: () => void;

    /** Called when browser Forward navigation restores this modal's history entry while the modal is closed */
    onOpen?: () => void;
};

type UseSyncModalWithHistory = (params: UseSyncModalWithHistoryParams) => void;

export default UseSyncModalWithHistory;
export type {UseSyncModalWithHistoryParams};
