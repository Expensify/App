type EmbeddedWisePageCallbacks = {
    /** Wise's page has loaded and can be shown */
    onReady: () => void;

    /** The user finished the flow. Only the server's webhook moves the account's status, so this only closes the page. */
    onDone: () => void;

    /** The user closed or cancelled the flow on Wise's page */
    onCancel: () => void;

    /** Wise's page cannot continue. A retry needs a new link. */
    onError: () => void;
};

type EmbeddedWisePageProps = EmbeddedWisePageCallbacks & {
    /** Link to Wise's embedded page. Its fragment carries a token, so it is never logged or put in a route. */
    url: string;

    /** Accessible name of the embedded page */
    title: string;
};

export type {EmbeddedWisePageCallbacks, EmbeddedWisePageProps};
