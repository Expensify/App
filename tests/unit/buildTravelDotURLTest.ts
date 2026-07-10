import {buildTravelDotURL} from '@libs/actions/Link';

import CONST from '@src/CONST';

describe('buildTravelDotURL', () => {
    const spotnanaToken = 'test-spotnana-token';

    it('Should build a production URL with the production TMC ID when not a test account', () => {
        const result = buildTravelDotURL(spotnanaToken, false);
        expect(result).toBe(`${CONST.TRAVEL_DOT_URL}/auth/code?authCode=${spotnanaToken}&tmcId=${CONST.SPOTNANA_TMC_ID}`);
    });

    it('Should build a staging URL with the staging TMC ID when a test account', () => {
        const result = buildTravelDotURL(spotnanaToken, true);
        expect(result).toBe(`${CONST.STAGING_TRAVEL_DOT_URL}/auth/code?authCode=${spotnanaToken}&tmcId=${CONST.STAGING_SPOTNANA_TMC_ID}`);
    });

    it('Should not append a redirectUrl parameter when no postLoginPath is provided', () => {
        const result = buildTravelDotURL(spotnanaToken, false);
        expect(result).not.toContain('redirectUrl');
    });

    it('Should append an encoded redirectUrl with a leading slash when a postLoginPath is provided', () => {
        const result = buildTravelDotURL(spotnanaToken, false, 'trips/123');
        expect(result).toBe(`${CONST.TRAVEL_DOT_URL}/auth/code?authCode=${spotnanaToken}&tmcId=${CONST.SPOTNANA_TMC_ID}&redirectUrl=${encodeURIComponent('/trips/123')}`);
    });

    it('Should not add a duplicate leading slash when the postLoginPath already starts with one', () => {
        const result = buildTravelDotURL(spotnanaToken, false, '/trips/123');
        expect(result).toContain(`redirectUrl=${encodeURIComponent('/trips/123')}`);
    });
});
