import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

/**
 * An event that can be published to Google Tag Manager. New events must be configured in GTM before they can be used
 * in the app.
 */
type GoogleTagManagerEvent = ValueOf<typeof CONST.ANALYTICS.EVENT>;

type GoogleTagManagerModule = {
    publishEvent: (event: GoogleTagManagerEvent, accountID: number) => void;
};

export default GoogleTagManagerModule;

export type {GoogleTagManagerEvent};
