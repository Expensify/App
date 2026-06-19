import type GoogleTagManagerModule from '@libs/GoogleTagManager/types';
import CONST from '@src/CONST';

// The fbq branching under test only exists in the web implementation (index.ts); the native variant
// (index.native.ts) reports to Firebase instead, so we load the web module explicitly.
const GoogleTagManager = jest.requireActual<{default: GoogleTagManagerModule}>('@libs/GoogleTagManager/index.ts').default;

type WindowWithPixels = Window & {
    dataLayer?: {push: jest.Mock};
    fbq?: jest.Mock;
};

const testWindow = window as WindowWithPixels;

const accountID = 123456;
const email = 'test@test.com';

describe('GoogleTagManager.publishEvent', () => {
    let dataLayerPush: jest.Mock;
    let fbq: jest.Mock;

    beforeEach(() => {
        dataLayerPush = jest.fn();
        fbq = jest.fn();
        testWindow.dataLayer = {push: dataLayerPush};
        testWindow.fbq = fbq;
    });

    afterEach(() => {
        delete testWindow.dataLayer;
        delete testWindow.fbq;
    });

    it('fires the standard Meta event (track) for the sales-eligible workspace_created event', () => {
        // When we publish the sales-eligible workspace_created event
        GoogleTagManager.publishEvent(CONST.ANALYTICS.EVENT.WORKSPACE_CREATED_SALES_ELIGIBLE.NAME, accountID, email);

        // Then fbq is called with the standard 'track' method and the mapped Meta event so Meta optimizes against its pre-trained "Lead" model
        expect(fbq).toHaveBeenCalledTimes(1);
        expect(fbq).toHaveBeenCalledWith(
            'track',
            CONST.ANALYTICS.EVENT.WORKSPACE_CREATED_SALES_ELIGIBLE.META,
            {em: email},
            {eventID: `${accountID}-${CONST.ANALYTICS.EVENT.WORKSPACE_CREATED_SALES_ELIGIBLE.NAME}`},
        );
    });

    it('fires a custom Meta event (trackCustom) for the standard workspace_created event', () => {
        // When we publish the standard workspace_created event
        GoogleTagManager.publishEvent(CONST.ANALYTICS.EVENT.WORKSPACE_CREATED.NAME, accountID, email);

        // Then fbq is called with 'trackCustom' so these lower-value conversions don't dilute the standard event optimization
        expect(fbq).toHaveBeenCalledTimes(1);
        expect(fbq).toHaveBeenCalledWith('trackCustom', CONST.ANALYTICS.EVENT.WORKSPACE_CREATED.META, {em: email}, {eventID: `${accountID}-${CONST.ANALYTICS.EVENT.WORKSPACE_CREATED.NAME}`});
    });

    it('fires the standard Meta event (track) for events that are not marked custom', () => {
        // When we publish the sign_up event, which is not flagged as a custom pixel event
        GoogleTagManager.publishEvent(CONST.ANALYTICS.EVENT.SIGN_UP.NAME, accountID, email);

        // Then fbq is called with the standard 'track' method
        expect(fbq).toHaveBeenCalledTimes(1);
        expect(fbq).toHaveBeenCalledWith('track', CONST.ANALYTICS.EVENT.SIGN_UP.META, {em: email}, {eventID: `${accountID}-${CONST.ANALYTICS.EVENT.SIGN_UP.NAME}`});
    });

    it('pushes to the dataLayer but does not call fbq when fbq is not loaded', () => {
        delete testWindow.fbq;

        // When we publish an event without the Meta pixel script loaded
        GoogleTagManager.publishEvent(CONST.ANALYTICS.EVENT.WORKSPACE_CREATED.NAME, accountID, email);

        // Then the event is still pushed to the GTM dataLayer
        expect(dataLayerPush).toHaveBeenCalledTimes(1);
    });

    it('does nothing when the dataLayer is not present', () => {
        delete testWindow.dataLayer;

        // When we publish an event before GTM has initialized the dataLayer
        GoogleTagManager.publishEvent(CONST.ANALYTICS.EVENT.WORKSPACE_CREATED.NAME, accountID, email);

        // Then no pixel events fire
        expect(fbq).not.toHaveBeenCalled();
    });
});
