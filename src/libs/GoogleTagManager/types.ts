/**
 * An event that can be published to Google Tag Manager. New events must be configured in GTM before they can be used
 * in the app.
 */
type GoogleTagManagerEvent = 'sign_up' | 'workspace_created' | 'paid_adoption';

type GoogleTagManagerModule = {
    publishEvent: (event: GoogleTagManagerEvent, accountID: number) => void;
};

export default GoogleTagManagerModule;

export type {GoogleTagManagerEvent};
