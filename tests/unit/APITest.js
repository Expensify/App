import _ from 'underscore';
import * as API from '../../src/libs/API';
import * as Network from '../../src/libs/Network';
import HttpUtils from '../../src/libs/HttpUtils';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import CONFIG from '../../src/CONFIG';

Network.setIsReady(true);

test('Authenticate should not make parallel auth requests', () => {
    // We're setting up a basic case where all requests succeed
    const xhr = jest.spyOn(HttpUtils, 'xhr').mockResolvedValue({jsonCode: 200});

    // Given multiple auth calls happening at the same time
    _.each(_.range(5), () => API.Authenticate({
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: 'testUserId',
        partnerUserSecret: 'testUserSecret',
    }));

    // Then a single auth request should be made
    return waitForPromisesToResolve()
        .then(() => {
            expect(xhr).toHaveBeenCalledTimes(1);
        });
});

test('Multiple Authenticate calls should be resolved with the same value', () => {
    // A mock where only the first xhr responds with 200 and all the rest 999
    const mockResponse = {jsonCode: 200};
    jest.spyOn(HttpUtils, 'xhr')
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValue({jsonCode: 999});

    // Given multiple auth calls happening at the same time
    const tasks = _.map(_.range(5), () => API.Authenticate({
        partnerName: CONFIG.EXPENSIFY.PARTNER_NAME,
        partnerPassword: CONFIG.EXPENSIFY.PARTNER_PASSWORD,
        partnerUserID: 'testUserId',
        partnerUserSecret: 'testUserSecret',
    }));

    // Then they all should be resolved from the first response
    return Promise.all(tasks)
        .then((results) => {
            expect(_.size(results)).toEqual(5);
            _.each(results, response => expect(response).toBe(mockResponse));
        });
});
