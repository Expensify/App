import * as API from '@libs/API';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';

import {linkCardFeedToPolicy} from '@userActions/CompanyCards';

import CONST from '@src/CONST';

let linkFeedRequestSpy: jest.SpiedFunction<typeof API.makeRequestWithSideEffects>;

describe('linkCardFeedToPolicy', () => {
    beforeEach(() => {
        linkFeedRequestSpy = jest.spyOn(API, 'makeRequestWithSideEffects');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {feedCountry: undefined, expectedCountry: CONST.COUNTRY.US},
        {feedCountry: '', expectedCountry: CONST.COUNTRY.US},
        {feedCountry: 'GB', expectedCountry: 'GB'},
    ])('resolves the same success response with country $feedCountry and no card credentials', async ({feedCountry, expectedCountry}) => {
        // Given the backend reports success without revealing any card secrets.
        const response = {jsonCode: CONST.JSON_CODE.SUCCESS};
        linkFeedRequestSpy.mockResolvedValue(response);

        // When the real action links a numbered feed.
        const result = await linkCardFeedToPolicy(777, 'policy123', 'csv', feedCountry, 'csv2');

        // Then the response identity is preserved and the existing country fallback reaches the API.
        expect(result).toBe(response);
        expect(linkFeedRequestSpy).toHaveBeenCalledTimes(1);
        expect(linkFeedRequestSpy).toHaveBeenCalledWith(SIDE_EFFECT_REQUEST_COMMANDS.LINK_CARD_FEED_TO_POLICY, {
            domainAccountID: 777,
            policyID: 'policy123',
            feedType: 'csv',
            feedName: 'csv2',
            feedCountry: expectedCountry,
        });
    });

    it.each([{jsonCode: 500}, {jsonCode: '200'}, {}, undefined])('rejects unsuccessful or absent response %j', async (response) => {
        // Given a non-success response, including the string form of the success code.
        linkFeedRequestSpy.mockResolvedValue(response);

        // When the real action handles the response.
        const result = linkCardFeedToPolicy(777, 'policy123', 'csv');

        // Then only numeric success can resolve and all failures keep the public translation key.
        await expect(result).rejects.toBe('common.genericErrorMessage');
    });

    it('rejects a failed request with the generic translation key', async () => {
        // Given the API rejects before a response is available.
        linkFeedRequestSpy.mockRejectedValue(new Error('request failed'));

        // When the action handles the failed request.
        const result = linkCardFeedToPolicy(777, 'policy123', 'csv');

        // Then the original generic error remains observable to page callers.
        await expect(result).rejects.toBe('common.genericErrorMessage');
    });
});
